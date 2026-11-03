import {
  DocumentCategory,
  ExtractedInformation,
  OCRResult,
  RecoveryAssessment,
  SimplificationResult,
  DocumentComparisonResult,
  AuthenticityReport,
} from '../types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function checkServerHealth(): Promise<{
  status: string;
  geminiKeyConfigured: boolean;
  supportedModels: string[];
  caches: Record<string, boolean>;
}> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err: any) {
    throw new ApiError('Cannot connect to DataKriti server: ' + err.message);
  }
}

export async function assessDocumentRecovery(
  imageBase64: string,
  filename?: string,
  mimeType: string = 'image/jpeg'
): Promise<RecoveryAssessment> {
  if (!navigator.onLine) {
    throw new ApiError('Recovery Intelligence requires an active internet connection to query vision models.');
  }

  const res = await fetch('/api/gemini/recovery-assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, filename, mimeType }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Condition assessment failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function runKannadaOCR(
  imageBase64: string,
  documentCategory: DocumentCategory = 'General Document',
  pageNumber: number = 1,
  mimeType: string = 'image/jpeg'
): Promise<OCRResult> {
  if (!navigator.onLine) {
    throw new ApiError('AI-powered Kannada OCR requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, documentCategory, pageNumber, mimeType }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Kannada OCR failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function getErrorCorrectionSuggestions(
  word: string,
  surroundingText?: string,
  documentContext?: string
): Promise<{
  originalWord: string;
  suggestions: Array<{ text: string; englishMeaning: string; confidence: string; linguisticReason: string }>;
  cached?: boolean;
  durationMs?: number;
}> {
  if (!navigator.onLine) {
    throw new ApiError('Error correction intelligence requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/error-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, surroundingText, documentContext }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Correction suggestions failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function scanTextForErrors(
  text: string,
  documentContext?: string
): Promise<{
  suspects: Array<{
    word: string;
    contextSnippet: string;
    reason: string;
    confidenceLevel: 'high' | 'medium' | 'low';
    heuristicSuggestions: string[];
  }>;
  cached?: boolean;
  durationMs?: number;
}> {
  const res = await fetch('/api/gemini/scan-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, documentContext }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Text scan failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function compareDocumentsApi(
  doc1Text: string,
  doc2Text: string,
  doc1Title = 'Original Document',
  doc2Title = 'Revised Document',
  language = 'Kannada'
): Promise<DocumentComparisonResult & { durationMs?: number; cached?: boolean }> {
  const res = await fetch('/api/gemini/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc1Text, doc2Text, doc1Title, doc2Title, language }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Document comparison failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function analyzeAuthenticityApi(
  documentId: string,
  documentTitle: string,
  imageBase64?: string,
  extractedText = '',
  fileMetadata: any = {}
): Promise<AuthenticityReport & { durationMs?: number; cached?: boolean }> {
  const res = await fetch('/api/gemini/authenticity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, documentTitle, imageBase64, extractedText, fileMetadata }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Authenticity analysis failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function translateDocumentText(
  text: string,
  targetLanguage: string
): Promise<{
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  keyVocabulary?: Array<{ kannada: string; translation: string; meaningInEnglish: string }>;
  translationNotes?: string;
  cached?: boolean;
  durationMs?: number;
}> {
  if (!navigator.onLine) {
    throw new ApiError('Translation requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Translation failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function generateDocumentSummary(
  text: string,
  summaryLength: 'short' | 'standard' | 'detailed' = 'standard',
  documentCategory: DocumentCategory = 'General Document'
): Promise<any> {
  if (!navigator.onLine) {
    throw new ApiError('Summary generation requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, summaryLength, documentCategory }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Summary generation failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function extractDocumentInfo(
  text: string,
  documentCategory: DocumentCategory = 'General Document'
): Promise<ExtractedInformation> {
  if (!navigator.onLine) {
    throw new ApiError('Information extraction requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/extract-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, documentCategory }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Information extraction failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function askDocument(
  question: string,
  documentText: string,
  conversationHistory: any[] = [],
  documentCategory: DocumentCategory = 'General Document'
): Promise<{
  answer: string;
  answerKannada?: string;
  isFoundInDocument: boolean;
  confidence: 'high' | 'moderate' | 'unsupported';
  sourceReferences: Array<{ sourceSnippet: string; relevance: string; pageEstimate?: number }>;
  suggestedFollowUps?: string[];
  cached?: boolean;
  durationMs?: number;
}> {
  if (!navigator.onLine) {
    throw new ApiError('Document Q&A requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, documentText, conversationHistory, documentCategory }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Ask Document failed (${res.status})`, res.status);
  }

  return await res.json();
}

export async function simplifyKannadaText(
  text: string
): Promise<SimplificationResult & { cached?: boolean; durationMs?: number }> {
  if (!navigator.onLine) {
    throw new ApiError('Language simplification requires an active internet connection.');
  }

  const res = await fetch('/api/gemini/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.error || `Language simplification failed (${res.status})`, res.status);
  }

  return await res.json();
}
