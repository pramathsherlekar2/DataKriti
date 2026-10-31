import React, { useState } from 'react';
import {
  Languages,
  Copy,
  Check,
  Download,
  Volume2,
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight,
  FileText,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS, TARGET_LANGUAGES } from '../../constants/accentColors';
import { translateDocumentText } from '../../services/api';
import { voiceReader } from '../../services/voiceReader';
import { exportTranslationText } from '../../services/exportService';

export const TranslationView: React.FC = () => {
  const { activeDocument, updateDocument, setActiveView, preferences, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [translationScope, setTranslationScope] = useState<'entire' | 'paragraph' | 'custom'>('entire');
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number>(0);
  const [customText, setCustomText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastTiming, setLastTiming] = useState<{ durationMs?: number; cached?: boolean } | null>(null);

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const fullKannadaText = page?.ocrResult?.correctedText || page?.ocrResult?.extractedText || '';
  const paragraphs = fullKannadaText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Compute text to translate based on scope
  const getSourceTextForScope = (): string => {
    if (translationScope === 'paragraph' && paragraphs[selectedParagraphIndex]) {
      return paragraphs[selectedParagraphIndex];
    }
    if (translationScope === 'custom' && customText.trim()) {
      return customText.trim();
    }
    return fullKannadaText;
  };

  const currentTranslation = activeDocument?.translations?.[selectedLanguage];

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <Languages className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Select or upload a Kannada document to translate into 8 Indian languages.</p>
        <button
          onClick={() => setActiveView('upload')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: accent.hex }}
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const handleTranslate = async (langName: string = selectedLanguage) => {
    const textToTranslate = getSourceTextForScope();
    if (!textToTranslate) {
      showToast('No Kannada text available to translate.', 'error');
      return;
    }

    setIsTranslating(true);
    setLastTiming(null);
    try {
      showToast(`Translating into ${langName}...`, 'info');
      const result = await translateDocumentText(textToTranslate, langName);

      setLastTiming({ durationMs: result.durationMs, cached: result.cached });

      const updatedDoc = {
        ...activeDocument,
        translations: {
          ...activeDocument.translations,
          [langName]: {
            id: 'trans-' + Date.now().toString(36),
            documentId: activeDocument.id,
            sourceLanguage: 'Kannada',
            targetLanguage: langName,
            translatedText: result.translatedText,
            keyVocabulary: result.keyVocabulary,
            translationNotes: result.translationNotes,
            creationDate: new Date().toISOString(),
          },
        },
      };

      await updateDocument(updatedDoc);
      showToast(`Translation to ${langName} complete! (${result.durationMs || 450}ms)`, 'success');
    } catch (err: any) {
      console.error('Translation error:', err);
      showToast(err.message || 'Translation failed. Please check network connection.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectLanguage = (langName: string) => {
    setSelectedLanguage(langName);
    if (!activeDocument.translations?.[langName]) {
      handleTranslate(langName);
    }
  };

  const handleCopy = () => {
    if (currentTranslation?.translatedText) {
      navigator.clipboard.writeText(currentTranslation.translatedText);
      setCopied(true);
      showToast(`Copied ${selectedLanguage} translation`, 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeakTranslation = () => {
    if (!currentTranslation?.translatedText) return;
    const targetObj = TARGET_LANGUAGES.find((l) => l.name === selectedLanguage);
    const langCode = targetObj ? `${targetObj.code}-IN` : 'en-US';
    voiceReader.playText(currentTranslation.translatedText, langCode);
    showToast(`Playing ${selectedLanguage} audio`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Language Selector Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                Multilingual Indian Language Translation
              </h2>
              <span className="text-xs font-kannada font-normal text-[#858B9E]">(೮ ಭಾಷೆಗಳಿಗೆ ನಿಖರ ಅನುವಾದ)</span>
            </div>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-0.5">
              Preserves legal nuance, paragraph layout, and authentic Indic Unicode scripts (Devanagari, Gurmukhi, Telugu, Tamil, Malayalam, Gujarati).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {lastTiming && (
              <span className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-600" />
                <span>{lastTiming.cached ? '⚡ Cached' : `${lastTiming.durationMs}ms`}</span>
              </span>
            )}
            <button
              onClick={() => handleTranslate(selectedLanguage)}
              disabled={isTranslating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: accent.hex }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{isTranslating ? 'Translating...' : `Translate to ${selectedLanguage}`}</span>
            </button>
          </div>
        </div>

        {/* 8 Target Language Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-[#E3DDD2] dark:border-[#2D334C]">
          {TARGET_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.name;
            const hasCached = Boolean(activeDocument.translations?.[lang.name]);

            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.name)}
                className={`p-2.5 rounded-xl text-center border transition-all relative ${
                  isSelected
                    ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#B7AAFF] font-bold shadow-xs ring-1 ring-[#7C3AED]'
                    : 'border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] text-[#575E75] dark:text-[#9CA3AF]'
                }`}
              >
                <div className="text-sm font-semibold">{lang.name}</div>
                <div className="text-[11px] opacity-75 mt-0.5">{lang.native}</div>
                {hasCached && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" title="Cached & Ready" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scope Selector: Entire Document / Individual Paragraph / Custom Excerpt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E3DDD2] dark:border-[#2D334C]">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#858B9E]">Translation Scope:</span>
            <div className="inline-flex rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] p-1 border border-[#E3DDD2] dark:border-[#2D334C]">
              <button
                onClick={() => setTranslationScope('entire')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  translationScope === 'entire' ? 'bg-white dark:bg-[#1A1E2F] font-bold shadow-2xs' : ''
                }`}
              >
                Entire Document
              </button>
              <button
                onClick={() => setTranslationScope('paragraph')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  translationScope === 'paragraph' ? 'bg-white dark:bg-[#1A1E2F] font-bold shadow-2xs' : ''
                }`}
              >
                By Paragraph
              </button>
              <button
                onClick={() => setTranslationScope('custom')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  translationScope === 'custom' ? 'bg-white dark:bg-[#1A1E2F] font-bold shadow-2xs' : ''
                }`}
              >
                Custom Excerpt
              </button>
            </div>
          </div>

          {/* Paragraph selector if in paragraph mode */}
          {translationScope === 'paragraph' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#858B9E]">Select Paragraph:</span>
              <select
                value={selectedParagraphIndex}
                onChange={(e) => setSelectedParagraphIndex(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] bg-transparent text-xs font-semibold"
              >
                {paragraphs.map((_, i) => (
                  <option key={i} value={i} className="bg-white dark:bg-[#1E2235]">
                    Paragraph #{i + 1} ({paragraphs[i].slice(0, 30)}...)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side: Original Kannada (Left) vs Translated Text (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Original Kannada Text (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D6A76C]" />
              <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA]">
                Source Kannada Content (ಮೂಲ ಕನ್ನಡ ಪಠ್ಯ)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F1ECE2] dark:bg-[#282D44] text-[#575E75] dark:text-[#B1B7CC] font-mono">
              {translationScope === 'entire' ? 'Full Document' : translationScope === 'paragraph' ? `Paragraph #${selectedParagraphIndex + 1}` : 'Custom Excerpt'}
            </span>
          </div>

          {translationScope === 'custom' ? (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type specific Kannada sentence or clause to translate..."
              rows={16}
              className="w-full p-4 rounded-2xl bg-[#F7F4EE]/60 dark:bg-[#22263A]/60 border border-[#E3DDD2] dark:border-[#2D334C] font-kannada text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-[#F7F4EE]/60 dark:bg-[#22263A]/60 border border-[#E3DDD2] dark:border-[#2D334C] min-h-[460px] max-h-[600px] overflow-y-auto text-sm font-kannada leading-relaxed text-[#1C2337] dark:text-[#F3F1FA] whitespace-pre-wrap select-text">
              {getSourceTextForScope() || 'No extracted text available.'}
            </div>
          )}
        </div>

        {/* Right: Translated Target Text (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA]">
                {selectedLanguage} Translation
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {currentTranslation && (
                <>
                  <button
                    onClick={handleSpeakTranslation}
                    className="p-1.5 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 text-[#575E75] dark:text-[#9CA3AF]"
                    title={`Listen to ${selectedLanguage}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 text-[#575E75] dark:text-[#9CA3AF]"
                    title="Copy Translation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => exportTranslationText(activeDocument, selectedLanguage)}
                    className="p-1.5 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 text-[#575E75] dark:text-[#9CA3AF]"
                    title="Download Translation Text"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Translation Content Area */}
          <div className="relative p-4 rounded-2xl bg-[#F7F4EE]/60 dark:bg-[#22263A]/60 border border-[#E3DDD2] dark:border-[#2D334C] min-h-[460px] max-h-[600px] overflow-y-auto text-sm leading-relaxed text-[#1C2337] dark:text-[#F3F1FA] whitespace-pre-wrap select-text">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center h-80 text-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
                <p className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">
                  Translating into {selectedLanguage}...
                </p>
                <p className="text-xs text-[#858B9E] max-w-sm">
                  Preserving exact script diacritics and administrative phrasing with Gemini 3.8 Flash.
                </p>
              </div>
            ) : currentTranslation ? (
              <div>{currentTranslation.translatedText}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center gap-3 text-[#858B9E]">
                <Languages className="w-10 h-10 opacity-40" />
                <p className="font-medium text-xs">
                  No {selectedLanguage} translation generated yet.
                </p>
                <button
                  onClick={() => handleTranslate(selectedLanguage)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: accent.hex }}
                >
                  Generate {selectedLanguage} Translation
                </button>
              </div>
            )}
          </div>

          {/* Key Vocabulary Table if present */}
          {currentTranslation?.keyVocabulary && currentTranslation.keyVocabulary.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E3DDD2] dark:border-[#2D334C] space-y-2">
              <h4 className="text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Key Terminology & Administrative Glossary:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentTranslation.keyVocabulary.map((voc, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-white dark:bg-[#1A1E2F] border border-[#E3DDD2] dark:border-[#2D334C]"
                  >
                    <div className="flex items-center justify-between font-kannada font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                      <span>{voc.kannada}</span>
                      <span className="text-[#7C3AED] font-normal">{voc.translation}</span>
                    </div>
                    <span className="text-[10px] text-[#858B9E] block mt-0.5">{voc.meaningInEnglish}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
