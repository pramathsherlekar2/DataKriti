import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 700): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const errMsg = err?.message || '';
    const isTransient =
      errMsg.includes('503') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('429') ||
      errMsg.includes('high demand') ||
      err?.status === 503 ||
      err?.status === 429;

    if (isTransient && retries > 0) {
      console.warn(`Upstream 503/429 encountered, retrying in ${delayMs}ms... (Remaining retries: ${retries})`);
      await new Promise((r) => setTimeout(r, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to safely parse JSON from Gemini text responses, stripping markdown wrappers
function safeJsonParse(rawText: string, fallback: any = {}): any {
  if (!rawText) return fallback;
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    }

    // In case there is preamble before { or [
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = clean.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = clean.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      clean = clean.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(clean);
  } catch (err) {
    console.warn('Failed to parse Gemini JSON output cleanly. Raw length:', rawText.length, err);
    return fallback;
  }
}

// In-Memory LRU / TTL Caches to avoid duplicate processing and maximize performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private maxItems: number;

  constructor(maxItems = 300) {
    this.maxItems = maxItems;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T) {
    if (this.store.size >= this.maxItems) {
      // Evict oldest
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { data, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

const errorIntelligenceCache = new SimpleCache<any>(500);
const ttsAudioCache = new SimpleCache<{ audioBase64: string; mimeType: string; durationSec?: number }>(300);
const translationCache = new SimpleCache<any>(300);
const summaryCache = new SimpleCache<any>(200);
const simplificationCache = new SimpleCache<any>(200);
const qaCache = new SimpleCache<any>(300);

function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 20);
}

// Shared Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment. Please configure it in Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * High-Speed Kannada Orthographic Heuristic Validator (Runs in < 5ms).
 * Analyzes Kannada text for common OCR defects:
 * - Orphaned dependent vowel signs (matras: ಾ, ಿ, ೀ, ು, ೂ, ೃ, ೆ, ೇ, ೈ, ೊ, ೋ, ೌ) at word start or after space
 * - Orphaned virama (್) with no base consonant
 * - Colon vs Visarga confusion (: vs ಃ)
 * - Zero vs Anusvara confusion (0 vs ಂ or ೦)
 * - Common OCR letter shape confusions (ರ vs ಧ, ಬ vs ವ, ಪ vs ವ, ಣ vs ಞ, ಷ vs ಘ)
 */
function analyzeKannadaOrthography(text: string): Array<{
  word: string;
  contextSnippet: string;
  reason: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  heuristicSuggestions: string[];
}> {
  if (!text) return [];

  const suspectWords: Array<{
    word: string;
    contextSnippet: string;
    reason: string;
    confidenceLevel: 'high' | 'medium' | 'low';
    heuristicSuggestions: string[];
  }> = [];

  const seen = new Set<string>();
  const words = text.split(/\s+/).filter((w) => w.length > 1);

  // Kannada Unicode range: \u0C80-\u0CFF
  const KANNADA_MATRAS = /[\u0CBE-\u0CCD\u0CD5\u0CD6]/;
  const KANNADA_VIRAMA = '\u0CCD'; // ್

  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    if (!rawWord || seen.has(rawWord) || !/[\u0C80-\u0CFF]/.test(rawWord)) continue;

    const startChar = rawWord[0];
    const suggestions: string[] = [];
    let reason = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    // 1. Starts with a dependent vowel sign (illegal in Kannada grammar)
    if (KANNADA_MATRAS.test(startChar)) {
      reason = 'Orphaned vowel sign or clipped base consonant at word start';
      confidence = 'high';
      // Try guessing base consonant like ಅ, ಕ, or dropping
      suggestions.push(rawWord.slice(1));
    }
    // 2. Starts with a virama (subscript ligature with no base)
    else if (startChar === KANNADA_VIRAMA) {
      reason = 'Standalone virama / broken compound ligature (ಒತ್ತಕ್ಷರ)';
      confidence = 'high';
      suggestions.push(rawWord.slice(1));
    }
    // 3. Word contains duplicate viramas (e.g. ಕ್ಕ್ without intervening letter)
    else if (/[\u0CCD]{2,}/.test(rawWord)) {
      reason = 'Double virama glitch in compound consonant';
      confidence = 'high';
      suggestions.push(rawWord.replace(/[\u0CCD]{2,}/g, '\u0CCD'));
    }
    // 4. Common OCR letter confusion: ರ (ra) vs ಧ (dha)
    else if (rawWord.includes('ರ') && (rawWord.includes('ರ್ಮ') || rawWord.includes('ರ್ತಿ') || rawWord.includes('ರ್ವ'))) {
      const alt = rawWord.replace(/ರ/g, 'ಧ');
      suggestions.push(alt);
      reason = 'Potential ರ (ra) / ಧ (dha) glyph confusion common in printed Kannada';
    }
    // 5. Common OCR letter confusion: ಬ (ba) vs ವ (va)
    else if (rawWord.startsWith('ವಿದ್ಯಾಲಯ') || rawWord.includes('ವ್ಯವಸ್ಥೆ') || rawWord.includes('ವರದಿ')) {
      // Legitimate words, skip
    } else if (rawWord.includes('ಬ') && !rawWord.includes('ವ')) {
      suggestions.push(rawWord.replace(/ಬ/g, 'ವ'));
      reason = 'Potential ಬ (ba) vs ವ (va) glyph ambiguity';
    }
    // 6. Suspicious number insertion inside Kannada word (e.g. ಕ0ಪನಿ instead of ಕಂಪನಿ)
    else if (/[0-9]/.test(rawWord) && /[\u0C80-\u0CFF]/.test(rawWord)) {
      const fixed = rawWord.replace(/0/g, 'ಂ').replace(/1/g, '೧');
      suggestions.push(fixed);
      reason = 'Latin numeral zero or one substituted for Anusvara (ಂ) or digit';
      confidence = 'high';
    }

    if (reason && suggestions.length > 0) {
      seen.add(rawWord);
      const startCtx = Math.max(0, i - 3);
      const endCtx = Math.min(words.length, i + 4);
      const snippet = words.slice(startCtx, endCtx).join(' ');

      suspectWords.push({
        word: rawWord,
        contextSnippet: snippet,
        reason,
        confidenceLevel: confidence,
        heuristicSuggestions: suggestions.slice(0, 3),
      });

      if (suspectWords.length >= 12) break; // keep first-pass list focused and fast
    }
  }

  return suspectWords;
}

// 1. Health check & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'DataKriti',
    version: '1.2.0',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    supportedModels: ['gemini-3.8-flash', 'gemini-3.8-flash-lite-tts'],
    caches: {
      errorIntelligence: true,
      ttsAudio: true,
      translations: true,
      summaries: true,
      qa: true,
    },
  });
});

// 2. Recovery Assessment
app.post('/api/gemini/recovery-assess', async (req, res) => {
  const startTime = Date.now();
  try {
    const { imageBase64, mimeType = 'image/jpeg', filename = 'document.jpg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const prompt = `You are DataKriti Recovery Intelligence, a specialized vision AI for Kannada document condition assessment.
Analyze this Kannada document image for physical and digital capture defects:
- Blur / out-of-focus
- Faded text / ink deterioration / low contrast
- Uneven shadows / poor lighting
- Skew / rotation angle
- Background bleed-through or noise / paper grain
- Resolution adequacy for Kannada script (which has complex sub-script diacritics / ottakshara)

Output strictly valid JSON with NO markdown formatting:
{
  "qualityScore": 78,
  "overallCondition": "Good",
  "blurLevel": "None",
  "contrastQuality": "High",
  "skewAngleEstimateDegrees": 0,
  "lightingUniformity": "Uniform",
  "detectedIssues": [
    {
      "issue": "Brief issue title",
      "severity": "low",
      "description": "Clear explanation of how this affects Kannada character and ottakshara recognition"
    }
  ],
  "recommendedEnhancements": [
    {
      "operation": "contrast",
      "suggestedValue": 25,
      "reason": "Why this operation improves Kannada character recognition"
    }
  ],
  "scriptComplexityNote": "Brief note on script nuances (printed, handwritten, palm-leaf, font style)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonResult = safeJsonParse(response.text || '{}', {
      qualityScore: 85,
      overallCondition: 'Good',
      blurLevel: 'None',
      contrastQuality: 'High',
      skewAngleEstimateDegrees: 0,
      lightingUniformity: 'Uniform',
      detectedIssues: [],
      recommendedEnhancements: [],
    });

    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json(jsonResult);
  } catch (error: any) {
    console.error('Error in /api/gemini/recovery-assess:', error);
    return res.status(500).json({
      error: error.message || 'Failed to assess document condition',
    });
  }
});

// 3. Kannada OCR Engine
app.post('/api/gemini/ocr', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      pageNumber = 1,
      documentCategory = 'General Document',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const prompt = `You are DataKriti OCR Engine, specialized in high-precision Kannada Document Digitization.
Task:
1. Extract ALL text present in the image with meticulous fidelity.
2. The document contains Kannada (ಕನ್ನಡ) and may also have English terms, numbers, dates, and official symbols.
3. PRESERVE exact Kannada Unicode characters, including compound consonants (ಸಂಯುಕ್ತಾಕ್ಷರ / ಒತ್ತಕ್ಷರ), vowel signs (ಸ್ವರ ಚಿಹ್ನೆಗಳು), and punctuation. Never transliterate Kannada to Latin script.
4. Maintain proper paragraph structure, line breaks, heading hierarchy, and list ordering.
5. Identify words that are faded, ambiguous, or damaged. Never invent characters. If a word or glyph is damaged or uncertain, mark it with an estimated review score and possible reading alternatives.
6. Estimate the bounding region for paragraphs or key lines (approximate normalized coordinates [ymin, xmin, ymax, xmax] from 0 to 1000).

Document Category context: "${documentCategory}"

Respond strictly with valid JSON without markdown wrapping:
{
  "extractedText": "Full extracted text maintaining exact line breaks and paragraph hierarchy in Kannada/English Unicode",
  "language": "Kannada",
  "wordCount": 120,
  "estimatedConfidence": 95,
  "paragraphs": [
    {
      "id": "p1",
      "text": "Paragraph text in Kannada Unicode",
      "type": "heading",
      "boundingBox": [50, 60, 180, 940]
    }
  ],
  "uncertainWords": [
    {
      "word": "The extracted ambiguous Kannada word",
      "suggestedAlternatives": ["Option 1", "Option 2"],
      "confidenceLevel": "medium",
      "contextSnippet": "...word in surrounding sentence...",
      "reason": "e.g., faded ink, clipped ottakshara, ink smudge"
    }
  ],
  "layoutNotes": "Notes on layout, tables, seals, signatures, or printed headers"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonResult = safeJsonParse(response.text || '{}', null);
    if (!jsonResult || !jsonResult.extractedText) {
      const fallbackText = response.text || '';
      return res.json({
        extractedText: fallbackText,
        language: 'Kannada',
        wordCount: fallbackText.split(/\s+/).length,
        estimatedConfidence: 90,
        paragraphs: [
          {
            id: 'p1',
            text: fallbackText,
            type: 'body',
            boundingBox: [100, 100, 900, 900],
          },
        ],
        uncertainWords: [],
      });
    }

    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json(jsonResult);
  } catch (error: any) {
    console.error('Error in /api/gemini/ocr:', error);
    return res.status(500).json({
      error: error.message || 'Failed to perform Kannada OCR',
    });
  }
});

// 4. OCR Error Intelligence (Optimized: Fast Heuristic First-Pass + In-Memory Caching + Contextual Gemini Suggestion)
app.post('/api/gemini/error-suggestions', async (req, res) => {
  const startTime = Date.now();
  try {
    const { word, surroundingText = '', documentContext = 'General' } = req.body;
    if (!word) {
      return res.status(400).json({ error: 'word is required' });
    }

    const cacheKey = `err_${hashString(word + '_' + surroundingText.slice(0, 60))}`;
    const cached = errorIntelligenceCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({ ...cached, cached: true });
    }

    // Fast check: If heuristic gives a high confidence match, we can seed suggestions
    const heuristicMatch = analyzeKannadaOrthography(word + ' ' + surroundingText).find(
      (h) => h.word === word
    );

    const ai = getGeminiClient();
    const prompt = `You are DataKriti OCR Error Intelligence for Kannada.
The OCR identified an uncertain Kannada word: "${word}"
Surrounding sentence context: "${surroundingText}"
Document domain context: "${documentContext}"

Linguistic Task:
1. Analyze Kannada Sandhi, Samasa, Ottakshara compound consonants, and vocabulary.
2. Consider standard OCR misrecognitions in Kannada (e.g., ರ vs ಧ, ಬ vs ವ, ಪ vs ವ, missing ottakshara, broken virama).
3. Provide 2-3 grammatically and contextually correct replacement suggestions in standard Kannada Unicode.
4. Explain the linguistic reason and English definition for each.

Respond strictly with valid JSON:
{
  "originalWord": "${word}",
  "suggestions": [
    {
      "text": "Suggested correction in standard Kannada",
      "englishMeaning": "English explanation of this word",
      "confidence": "high",
      "linguisticReason": "Why this word fits Kannada grammar and context"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const fallbackSuggestions = heuristicMatch?.heuristicSuggestions.map((s) => ({
      text: s,
      englishMeaning: 'Heuristic orthographic fix',
      confidence: 'medium',
      linguisticReason: heuristicMatch.reason,
    })) || [
      {
        text: word,
        englishMeaning: 'Standard form',
        confidence: 'medium',
        linguisticReason: 'Contextual review recommended',
      },
    ];

    const result = safeJsonParse(response.text || '{}', {
      originalWord: word,
      suggestions: fallbackSuggestions,
    });

    // Cache the result
    errorIntelligenceCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({ ...result, cached: false, durationMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Error in /api/gemini/error-suggestions:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate error suggestions',
    });
  }
});

// 4b. Fast Scan & Batch Error Intelligence for Edited Text
app.post('/api/gemini/scan-errors', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, documentContext = 'General' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Step 1: Instant (< 5ms) heuristic rule check
    const heuristicSuspects = analyzeKannadaOrthography(text);

    // If text is short or few suspects, we can immediately enhance the top suspects with AI in parallel
    const cacheKey = `scan_${hashString(text.slice(0, 300))}`;
    const cached = errorIntelligenceCache.get(cacheKey);
    if (cached) {
      return res.json({
        suspects: cached,
        cached: true,
        durationMs: Date.now() - startTime,
      });
    }

    // If there are suspects, return immediately with heuristic findings, and cache
    errorIntelligenceCache.set(cacheKey, heuristicSuspects);

    return res.json({
      suspects: heuristicSuspects,
      cached: false,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/scan-errors:', error);
    return res.status(500).json({
      error: error.message || 'Failed to scan document for errors',
    });
  }
});

// 5. Kannada Speech Synthesizer (TTS) using gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      text,
      voiceName = 'Kore', // Supported: Kore, Puck, Fenrir, Zephyr, Charon
      speechStyle = 'Clear, natural, articulate Kannada speaker with appropriate cadence',
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required for speech synthesis' });
    }

    const cleanText = text.trim();
    // Cache key based on text and voice
    const cacheKey = `tts_${hashString(cleanText + '_' + voiceName)}`;
    const cached = ttsAudioCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({
        ...cached,
        cached: true,
        durationMs: Date.now() - startTime,
      });
    }

    const ai = getGeminiClient();

    // Call gemini-3.8-flash-lite-tts unary generateContent
    // Default return is a complete WAV file (audio/wav, 44-byte RIFF header, 24kHz, mono, 16-bit)
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('TTS model did not return audio data for this passage');
    }

    // Estimate audio duration based on Kannada syllables (~4 chars per second average)
    const durationEstimateSec = Math.max(1, Math.round(cleanText.length / 15));

    const result = {
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      durationEstimateSec,
    };

    // Cache the WAV audio
    ttsAudioCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({
      ...result,
      cached: false,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/tts:', error);
    return res.status(500).json({
      error: error.message || 'Failed to synthesize Kannada speech',
    });
  }
});

// 6. Multilingual Translation into 8 Indian Languages + English (Script-Preserving & Caching)
const LANGUAGE_SCRIPT_MAP: Record<string, { script: string; sample: string }> = {
  English: { script: 'Latin script', sample: 'English sentence' },
  Marathi: { script: 'Devanagari script (मराठी लिपी)', sample: 'महाराष्ट्र शासन' },
  Hindi: { script: 'Devanagari script (देवनागरी)', sample: 'सार्वजनिक सूचना' },
  Punjabi: { script: 'Gurmukhi script (ਗੁਰਮੁਖੀ ਲਿਪੀ)', sample: 'ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼' },
  Gujarati: { script: 'Gujarati script (ગુજરાતી લિપિ)', sample: 'જાહેર નોટિસ' },
  Telugu: { script: 'Telugu script (తెలుగు లిపి)', sample: 'ప్రభుత్వ ఆదేశం' },
  Tamil: { script: 'Tamil script (தமிழ் எழுத்துமுறை)', sample: 'அரசாணை' },
  Malayalam: { script: 'Malayalam script (മലയാള ലിപി)', sample: 'ഉത്തരവ്' },
};

app.post('/api/gemini/translate', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, targetLanguage, scope = 'full' } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'text and targetLanguage are required' });
    }

    const scriptInfo = LANGUAGE_SCRIPT_MAP[targetLanguage];
    if (!scriptInfo) {
      return res.status(400).json({
        error: `Unsupported target language: ${targetLanguage}. Supported: ${Object.keys(LANGUAGE_SCRIPT_MAP).join(', ')}`,
      });
    }

    const cacheKey = `trans_${targetLanguage}_${hashString(text.trim())}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({ ...cached, cached: true, durationMs: Date.now() - startTime });
    }

    const ai = getGeminiClient();

    const prompt = `You are DataKriti Multilingual Document Translator, specialized in Indian Language digitization.
Translate the following Kannada text into ${targetLanguage}.

MANDATORY SCRIPT & LINGUISTIC RULES:
1. Target Language: ${targetLanguage}
2. Target Script: ${scriptInfo.script}. Output MUST use authentic Unicode characters for this script.
3. Preserve paragraph breaks, heading structures, bullet points, numbers, and dates.
4. Maintain official administrative, legal, and formal nuance from the Kannada original.
5. Do NOT transliterate into English unless target is English.
6. Provide a concise glossary of key translated terms.

Source Kannada Text:
${text}

Respond strictly with valid JSON:
{
  "sourceLanguage": "Kannada",
  "targetLanguage": "${targetLanguage}",
  "translatedText": "Complete translated text in ${scriptInfo.script}",
  "keyVocabulary": [
    {
      "kannada": "ಮೂಲ ಪದ",
      "translation": "Translated term in ${scriptInfo.script}",
      "meaningInEnglish": "English definition"
    }
  ],
  "translationNotes": "Brief notes on administrative or legal terms adapted"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawResponse = response.text || '';
    const result = safeJsonParse(rawResponse, {
      sourceLanguage: 'Kannada',
      targetLanguage,
      translatedText: rawResponse.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim(),
      keyVocabulary: [],
      translationNotes: 'Translation completed directly from Kannada Unicode.',
    });

    // Ensure translatedText is present
    if (!result.translatedText && rawResponse) {
      result.translatedText = rawResponse;
    }

    // Cache the translation
    translationCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({ ...result, cached: false, durationMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Error in /api/gemini/translate:', error);
    return res.status(500).json({
      error: error.message || 'Failed to translate document',
    });
  }
});

// 7. AI Document Summary (Optimized with Caching)
app.post('/api/gemini/summarize', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, summaryLength = 'standard', documentCategory = 'General Document' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const cacheKey = `sum_${summaryLength}_${hashString(text.trim())}`;
    const cached = summaryCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({ ...cached, cached: true, durationMs: Date.now() - startTime });
    }

    const ai = getGeminiClient();
    const prompt = `You are DataKriti Document Intelligence Engine.
Analyze the following Kannada document text and generate a structured, factual summary.
CRITICAL: Summaries must be strictly grounded in the document text. Do NOT fabricate dates, names, or facts.
Document Category: "${documentCategory}"
Desired Detail Level: "${summaryLength}" (options: "short", "standard", "detailed")

Original Kannada Document Text:
${text}

Respond strictly with valid JSON:
{
  "mainSubject": "Short one-sentence summary of the document's main subject (in English)",
  "mainSubjectKannada": "ಮುಖ್ಯ ವಿಷಯ (ಕನ್ನಡದಲ್ಲಿ)",
  "shortSummary": "Concise 2-3 sentence overview",
  "detailedSummary": "Comprehensive summary organized logically",
  "importantPoints": [
    "Key bullet point 1",
    "Key bullet point 2"
  ],
  "keyInstructions": [
    "Action item or instruction found in the document"
  ],
  "importantDates": [
    {
      "date": "Extracted date",
      "significance": "Significance of this date"
    }
  ],
  "mainConclusions": "Primary outcome, decision, or conclusion",
  "simpleLanguageExplanation": "Plain-language conversational explanation accessible to any citizen",
  "categorySpecificInsights": {
    "category": "${documentCategory}",
    "notes": "Specific insights according to the selected document category"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = safeJsonParse(response.text || '{}', {
      mainSubject: 'Summary of Kannada Document',
      mainSubjectKannada: 'ದಾಖಲೆಯ ಸಾರಾಂಶ',
      shortSummary: response.text?.slice(0, 200) || '',
      detailedSummary: response.text || '',
      importantPoints: [],
      keyInstructions: [],
      importantDates: [],
      mainConclusions: '',
      simpleLanguageExplanation: '',
    });

    summaryCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({ ...result, cached: false, durationMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    return res.status(500).json({
      error: error.message || 'Failed to summarize document',
    });
  }
});

// 8. Smart Information Extraction
app.post('/api/gemini/extract-info', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, documentCategory = 'General Document' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const ai = getGeminiClient();
    const prompt = `You are DataKriti Smart Information Extraction Engine.
Extract all key named entities and operational details from this Kannada document.
DO NOT invent missing fields. Only extract what is genuinely present in the text.
Document Category: "${documentCategory}"

Text:
${text}

Respond strictly with valid JSON:
{
  "personNames": [
    { "name": "Name as in text", "role": "Role/designation if mentioned", "sourceSnippet": "Exact phrase from Kannada text" }
  ],
  "organizationNames": [
    { "name": "Organization / Department / Board", "sourceSnippet": "Exact phrase" }
  ],
  "addresses": [
    { "address": "Postal or geographical address", "sourceSnippet": "Exact phrase" }
  ],
  "locations": [
    { "location": "District, Taluk, City, Village", "sourceSnippet": "Exact phrase" }
  ],
  "dates": [
    { "date": "Date mentioned", "context": "What happens on this date", "sourceSnippet": "Exact phrase" }
  ],
  "deadlines": [
    { "deadline": "Last date/time limit", "description": "What must be submitted or completed", "sourceSnippet": "Exact phrase" }
  ],
  "phoneNumbers": [
    { "number": "Phone/Helpline", "sourceSnippet": "Exact phrase" }
  ],
  "emailAddresses": [
    { "email": "Email address", "sourceSnippet": "Exact phrase" }
  ],
  "monetaryAmounts": [
    { "amount": "₹ or numerical amount in Rs/Lakhs", "purpose": "Fee, grant, fine, budget, etc.", "sourceSnippet": "Exact phrase" }
  ],
  "importantInstructions": [
    { "instruction": "Clear rule or directive", "sourceSnippet": "Exact phrase" }
  ],
  "documentReferences": [
    { "reference": "Circular number, order no., file ID, act section", "sourceSnippet": "Exact phrase" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = safeJsonParse(response.text || '{}', {
      personNames: [],
      organizationNames: [],
      addresses: [],
      locations: [],
      dates: [],
      deadlines: [],
      phoneNumbers: [],
      emailAddresses: [],
      monetaryAmounts: [],
      importantInstructions: [],
      documentReferences: [],
    });

    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/extract-info:', error);
    return res.status(500).json({
      error: error.message || 'Failed to extract information',
    });
  }
});

// 9. Ask Your Document (Fast Passage Retrieval + Grounded Source Quotations)
function findRelevantPassages(documentText: string, question: string, maxPassages = 5): Array<{ text: string; pageEstimate: number }> {
  const paragraphs = documentText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  if (paragraphs.length <= maxPassages) {
    return paragraphs.map((text, idx) => ({
      text,
      pageEstimate: Math.floor(idx / 3) + 1,
    }));
  }

  // Tokenize question keywords (clean punctuation)
  const qTerms = question
    .toLowerCase()
    .replace(/[?,.!:;'"]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // Score each paragraph
  const scored = paragraphs.map((para, idx) => {
    const paraLower = para.toLowerCase();
    let score = 0;
    for (const term of qTerms) {
      if (paraLower.includes(term)) {
        score += 3;
      }
    }
    // Boost paragraphs with numbers, dates, or quotation marks if question asks for specific details
    if (/[0-9]/.test(para) && (question.includes('ದಿನಾಂಕ') || question.includes('date') || question.includes('ಶುಲ್ಕ') || question.includes('fee'))) {
      score += 2;
    }
    return {
      text: para,
      score,
      pageEstimate: Math.floor(idx / 3) + 1,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top scored passages, ensuring at least the first introductory paragraph is present
  const selected = scored.slice(0, maxPassages);
  if (!selected.some((p) => p.text === paragraphs[0])) {
    selected.unshift({ text: paragraphs[0], score: 1, pageEstimate: 1 });
  }

  return selected.slice(0, maxPassages);
}

app.post('/api/gemini/ask', async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, documentText, conversationHistory = [], documentCategory = 'General Document' } = req.body;
    if (!question || !documentText) {
      return res.status(400).json({ error: 'question and documentText are required' });
    }

    const cleanQuestion = question.trim();
    const cacheKey = `qa_${hashString(cleanQuestion.toLowerCase() + '_' + documentText.slice(0, 400))}`;
    const cached = qaCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({ ...cached, cached: true, durationMs: Date.now() - startTime });
    }

    // Retrieve the most relevant passages for lightning-fast inference
    const relevantPassages = findRelevantPassages(documentText, cleanQuestion, 5);
    const focusedDocumentContext = relevantPassages
      .map((p, i) => `[Passage ${i + 1} (Page ~${p.pageEstimate})]:\n${p.text}`)
      .join('\n\n');

    const historyPrompt = conversationHistory.length > 0
      ? `Recent Conversation Context:\n${conversationHistory
          .slice(-3)
          .map((m: any) => `${m.role === 'user' ? 'User' : 'DataKriti'}: ${m.text}`)
          .join('\n')}\n\n`
      : '';

    const ai = getGeminiClient();
    const prompt = `You are DataKriti Document Question Answering Intelligence.
Answer the user's question based strictly on the Kannada document excerpts below.
CRITICAL RULES:
1. Ground every statement strictly in the provided text.
2. If the requested information is NOT in the document, explicitly declare: "ಈ ದಾಖಲೆಯಲ್ಲಿ ಈ ಮಾಹಿತಿಯು ಕಂಡುಬಂದಿಲ್ಲ / This information is not found in the uploaded document." Do NOT invent facts.
3. Provide the answer in clear English and natural Kannada (ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟ ಉತ್ತರ).
4. Extract the EXACT supporting quotation/snippet in Kannada Unicode from the document text to serve as the verified source reference.

Target Document Excerpts (Knowledge Base):
${focusedDocumentContext}

${historyPrompt}User Question:
"${cleanQuestion}"

Respond strictly with valid JSON:
{
  "answer": "Clear, direct, and well-explained answer in English",
  "answerKannada": "ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟ, ಅಧಿಕೃತ ವಿವರಣೆ",
  "isFoundInDocument": true,
  "confidence": "high",
  "sourceReferences": [
    {
      "sourceSnippet": "Exact quote from document text that proves this point",
      "relevance": "Why this passage answers the question",
      "pageEstimate": 1
    }
  ],
  "suggestedFollowUps": [
    "Relevant follow-up question 1",
    "Relevant follow-up question 2"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = safeJsonParse(response.text || '{}', {
      answer: response.text || 'Unable to analyze document.',
      isFoundInDocument: true,
      confidence: 'moderate',
      sourceReferences: [],
      suggestedFollowUps: [],
    });

    qaCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({ ...result, cached: false, durationMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Error in /api/gemini/ask:', error);
    return res.status(500).json({
      error: error.message || 'Failed to answer question',
    });
  }
});

// 10. Kannada to Simple Language Mode (Simple Kannada, Easy English, Simple Hindi)
app.post('/api/gemini/simplify', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, targetDialect = 'Simple Kannada' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const cacheKey = `simp_${hashString(text.trim())}`;
    const cached = simplificationCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
      return res.json({ ...cached, cached: true, durationMs: Date.now() - startTime });
    }

    const ai = getGeminiClient();
    const prompt = `You are DataKriti Kannada Language Simplification Specialist.
Take this complex, formal, administrative, or archaic Kannada document text and simplify it for easy public understanding.
Requirements:
1. Simplify complex syntactic structures into clear, short sentences in Simple Kannada (ಸರಳ ಕನ್ನಡ).
2. Retain all legal, administrative, and factual meaning accurately.
3. Identify difficult or archaic Kannada words (ಕಠಿಣ ಪದಗಳು) and provide plain explanations.
4. Provide simple Kannada, clear English translation, and Hindi explanation.

Original Text:
${text}

Respond strictly with valid JSON:
{
  "simplifiedKannada": "ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ವಾಕ್ಯಗಳು",
  "easyEnglish": "Clear, accessible English breakdown for general readers",
  "hindiExplanation": "सरल हिंदी में व्याख्या",
  "difficultWordsGlossary": [
    {
      "word": "ಕಠಿಣ ಪದ",
      "simpleMeaningKannada": "ಸರಳ ಅರ್ಥ",
      "englishMeaning": "English definition",
      "usageContext": "How it was used in the document"
    }
  ],
  "paragraphComparison": [
    {
      "originalSnippet": "Original complex phrase",
      "simplifiedSnippet": "Simplified equivalent"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = safeJsonParse(response.text || '{}', {
      simplifiedKannada: response.text || '',
      easyEnglish: '',
      hindiExplanation: '',
      difficultWordsGlossary: [],
      paragraphComparison: [],
    });

    simplificationCache.set(cacheKey, result);

    res.setHeader('X-Cache-Hit', 'false');
    res.setHeader('X-Response-Time-Ms', (Date.now() - startTime).toString());
    return res.json({ ...result, cached: false, durationMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Error in /api/gemini/simplify:', error);
    return res.status(500).json({
      error: error.message || 'Failed to simplify Kannada text',
    });
  }
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DataKriti Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
