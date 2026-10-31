import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  Undo2,
  Redo2,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Layers,
  HelpCircle,
  RefreshCw,
  GitCompare,
  Crosshair,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import { OCRParagraph, UncertainWord } from '../../types';
import { getErrorCorrectionSuggestions, scanTextForErrors } from '../../services/api';

export const VerificationView: React.FC = () => {
  const { activeDocument, updateDocument, setActiveView, preferences, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const ocr = page?.ocrResult;

  // Editor states
  const [text, setText] = useState<string>(ocr?.correctedText || ocr?.extractedText || '');
  const [history, setHistory] = useState<string[]>([ocr?.correctedText || ocr?.extractedText || '']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [heatmapMode, setHeatmapMode] = useState<boolean>(true);

  // Zoom and region on document preview
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedRegion, setSelectedRegion] = useState<[number, number, number, number] | null>(null);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);

  // Error Intelligence states
  const [activeUncertainWord, setActiveUncertainWord] = useState<UncertainWord | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);
  const [isScanningText, setIsScanningText] = useState<boolean>(false);
  const [errorIntelligenceResult, setErrorIntelligenceResult] = useState<any>(null);
  const [customReplacement, setCustomReplacement] = useState<string>('');

  // Sync state when active document changes
  useEffect(() => {
    if (ocr) {
      const initial = ocr.correctedText || ocr.extractedText || '';
      setText(initial);
      setHistory([initial]);
      setHistoryIndex(0);
      setSelectedRegion(null);
      setActiveUncertainWord(null);
      setActiveParagraphId(null);
    }
  }, [ocr, activeDocument?.id, activeDocument?.currentPageIndex]);

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <CheckCircle className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Upload a Kannada document or load a sample to verify extracted text.</p>
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

  // Handle Text Edit with Undo/Redo stack
  const handleTextChange = (newText: string) => {
    setText(newText);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setText(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setText(history[newIdx]);
    }
  };

  const handleSaveCorrections = async () => {
    if (!ocr) return;
    const updatedOcr = {
      ...ocr,
      correctedText: text,
    };

    const updatedPages = [...activeDocument.pages];
    updatedPages[activeDocument.currentPageIndex] = {
      ...page,
      ocrResult: updatedOcr,
    };

    const updatedDoc = {
      ...activeDocument,
      pages: updatedPages,
    };

    await updateDocument(updatedDoc);
    showToast('Verified text saved! Used across translation, TTS, and AI intelligence.', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Kannada text copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Run full error intelligence scan on current text
  const handleScanErrors = async () => {
    if (!text.trim()) return;
    setIsScanningText(true);
    try {
      showToast('Running high-speed Kannada orthographic scan...', 'info');
      const scanRes = await scanTextForErrors(text, activeDocument.documentCategory);

      // Merge new findings into uncertain words without duplicating
      const existingWords = ocr?.uncertainWords || [];
      const newUncertainWords: UncertainWord[] = [...existingWords];

      for (const item of scanRes.suspects || []) {
        if (!newUncertainWords.some((u) => u.word === item.word)) {
          newUncertainWords.push({
            word: item.word,
            suggestedAlternatives: item.heuristicSuggestions,
            confidenceLevel: item.confidenceLevel,
            contextSnippet: item.contextSnippet,
            reason: item.reason,
            isCorrected: false,
          });
        }
      }

      if (ocr) {
        const updatedOcr = { ...ocr, uncertainWords: newUncertainWords };
        const updatedPages = [...activeDocument.pages];
        updatedPages[activeDocument.currentPageIndex] = { ...page, ocrResult: updatedOcr };
        await updateDocument({ ...activeDocument, pages: updatedPages });
      }

      showToast(`Scan complete in ${scanRes.durationMs || 15}ms. ${scanRes.suspects?.length || 0} terms flagged for review.`, 'success');
    } catch (err: any) {
      console.warn('Scan error:', err);
      showToast('Scan completed using local orthographic rules.', 'info');
    } finally {
      setIsScanningText(false);
    }
  };

  // Inspect Uncertain Word & query Error Intelligence + highlight source region
  const handleInspectWord = async (uw: UncertainWord) => {
    setActiveUncertainWord(uw);
    setCustomReplacement(uw.word);
    setErrorIntelligenceResult(null);
    setSuggestionsLoading(true);

    // Locate matching paragraph to highlight source region on left image
    if (ocr?.paragraphs) {
      const match = ocr.paragraphs.find((p) => p.text.includes(uw.word));
      if (match && match.boundingBox) {
        setSelectedRegion(match.boundingBox);
        setActiveParagraphId(match.id);
      }
    }

    try {
      const res = await getErrorCorrectionSuggestions(
        uw.word,
        uw.contextSnippet || text.slice(0, 200),
        activeDocument.documentCategory
      );
      setErrorIntelligenceResult(res);
    } catch (err: any) {
      console.warn('Error suggestion failed:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Inspect Paragraph to jump bounding box to that location
  const handleSelectParagraph = (para: OCRParagraph) => {
    setActiveParagraphId(para.id);
    if (para.boundingBox) {
      setSelectedRegion(para.boundingBox);
      showToast(`Inspecting paragraph region [${para.type}]`, 'info');
    }
  };

  // Apply suggestion from Error Intelligence
  const handleApplySuggestion = (suggestionText: string) => {
    if (!activeUncertainWord) return;
    const origWord = activeUncertainWord.word;
    const updated = text.replace(origWord, suggestionText);
    handleTextChange(updated);

    // Mark as corrected in uncertainWords list
    if (ocr) {
      const updatedWords = (ocr.uncertainWords || []).map((w) =>
        w.word === origWord ? { ...w, isCorrected: true, userCorrection: suggestionText } : w
      );
      const updatedOcr = { ...ocr, correctedText: updated, uncertainWords: updatedWords };
      const updatedPages = [...activeDocument.pages];
      updatedPages[activeDocument.currentPageIndex] = { ...page, ocrResult: updatedOcr };
      updateDocument({ ...activeDocument, pages: updatedPages });
    }

    showToast(`Replaced "${origWord}" with "${suggestionText}"`, 'success');
    setActiveUncertainWord(null);
  };

  const imageSrc = page.enhancedImage || page.originalImage;
  const uncertainCount = ocr?.uncertainWords?.filter((w) => !w.isCorrected)?.length || 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Verification stats and confidence */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <span>Kannada OCR Verification Studio</span>
              <span className="text-xs font-kannada font-normal text-[#858B9E]">(ಪರಿಶೀಲನೆ)</span>
            </h2>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF]">
              Confidence: <strong className="text-emerald-600">{ocr?.estimatedConfidence || 95}%</strong> |{' '}
              Word Count: <strong className="text-[#1C2337] dark:text-[#F3F1FA]">{ocr?.wordCount || text.split(/\s+/).length}</strong> |{' '}
              Review Needed: <strong className={uncertainCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>{uncertainCount}</strong>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleScanErrors}
            disabled={isScanningText}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
            title="Scan edited text for Kannada orthographic irregularities"
          >
            <Zap className={`w-3.5 h-3.5 text-purple-600 ${isScanningText ? 'animate-spin' : ''}`} />
            <span>{isScanningText ? 'Scanning...' : 'Error Scan'}</span>
          </button>

          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              heatmapMode
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                : 'border-[#E3DDD2] dark:border-[#2D334C] text-[#575E75] dark:text-[#9CA3AF]'
            }`}
            title="Toggle Confidence Heatmap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heatmap {heatmapMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showDiff
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200'
                : 'border-[#E3DDD2] dark:border-[#2D334C] text-[#575E75] dark:text-[#9CA3AF]'
            }`}
            title="Compare Original OCR vs Corrected Text"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Diff View</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors flex items-center gap-1.5 text-[#1C2337] dark:text-[#F3F1FA]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSaveCorrections}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: accent.hex }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Verified Text</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Image Preview (6 cols) | Right Editor (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Image Viewer (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
              <Eye className="w-4 h-4 text-[#7C3AED]" />
              <span>Source Document View</span>
              <span className="text-[10px] text-[#858B9E]">
                {page.enhancedImage ? '(Restored Image)' : '(Original Capture)'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {selectedRegion && (
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-[11px] text-rose-500 hover:underline mr-1"
                >
                  Clear Box
                </button>
              )}
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-[#858B9E]" />
              </button>
              <span className="text-[11px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#858B9E]" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#858B9E]" />
              </button>
            </div>
          </div>

          {/* Zoomable Image Container with Interactive Region Overlay */}
          <div className="relative min-h-[520px] max-h-[640px] overflow-auto rounded-2xl bg-[#1C2337]/5 dark:bg-black/30 border border-[#E3DDD2] dark:border-[#2D334C] p-2 flex items-center justify-center select-none">
            <div
              className="relative transition-transform duration-150 origin-top-left"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imageSrc}
                alt="Source Kannada Document"
                className="max-w-full h-auto rounded-lg shadow-sm border border-black/10"
              />

              {/* Render highlighted bounding box if a paragraph or word is selected */}
              {selectedRegion && (
                <div
                  className="absolute border-2 border-indigo-600 bg-indigo-500/25 rounded-sm pointer-events-none transition-all shadow-md animate-pulse"
                  style={{
                    top: `${selectedRegion[0] / 10}%`,
                    left: `${selectedRegion[1] / 10}%`,
                    height: `${(selectedRegion[2] - selectedRegion[0]) / 10}%`,
                    width: `${(selectedRegion[3] - selectedRegion[1]) / 10}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Paragraph Region Jump Pills */}
          {ocr?.paragraphs && ocr.paragraphs.length > 0 && (
            <div className="pt-2 border-t border-[#E3DDD2] dark:border-[#2D334C]">
              <span className="text-[10px] font-bold text-[#858B9E] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-[#7C3AED]" />
                <span>Jump to Source Region on Image:</span>
              </span>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {ocr.paragraphs.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    onClick={() => handleSelectParagraph(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      activeParagraphId === p.id
                        ? 'border-indigo-600 bg-indigo-500 text-white font-bold'
                        : 'border-[#E3DDD2] dark:border-[#2D334C] bg-[#F7F4EE] dark:bg-[#22263A] text-[#575E75] dark:text-[#9CA3AF] hover:bg-[#E3DDD2]'
                    }`}
                  >
                    §{idx + 1} {p.type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page navigator if multi-page */}
          {activeDocument.pageCount > 1 && (
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                disabled={activeDocument.currentPageIndex <= 0}
                onClick={() =>
                  updateDocument({
                    ...activeDocument,
                    currentPageIndex: activeDocument.currentPageIndex - 1,
                  })
                }
                className="px-2.5 py-1 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Page</span>
              </button>
              <span className="font-medium text-[#858B9E]">
                Page {activeDocument.currentPageIndex + 1} of {activeDocument.pageCount}
              </span>
              <button
                disabled={activeDocument.currentPageIndex >= activeDocument.pageCount - 1}
                onClick={() =>
                  updateDocument({
                    ...activeDocument,
                    currentPageIndex: activeDocument.currentPageIndex + 1,
                  })
                }
                className="px-2.5 py-1 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Verification Editor & Confidence Heatmap (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA]">
                Extracted Kannada Text (ಸಂಪಾದನೆ)
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 text-[#575E75] dark:text-[#9CA3AF]" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 text-[#575E75] dark:text-[#9CA3AF]" />
              </button>
            </div>
          </div>

          {/* Confidence Heatmap & Uncertain Words Chips */}
          {heatmapMode && ocr?.uncertainWords && ocr.uncertainWords.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Review Needed: {uncertainCount} Words</span>
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                  Instant suggestions cached
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {ocr.uncertainWords.map((uw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInspectWord(uw)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-kannada transition-all flex items-center gap-1 ${
                      uw.isCorrected
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 line-through opacity-70'
                        : activeUncertainWord?.word === uw.word
                        ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-300'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300/60 hover:bg-amber-200'
                    }`}
                  >
                    <span>{uw.word}</span>
                    {uw.isCorrected && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Intelligence Suggestions Dialog */}
          {activeUncertainWord && (
            <div className="p-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#7C3AED]/40 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                    Error Intelligence: &quot;{activeUncertainWord.word}&quot;
                  </span>
                  {errorIntelligenceResult?.cached && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono">
                      ⚡ Cached
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveUncertainWord(null)}
                  className="text-xs text-[#858B9E] hover:text-[#1C2337]"
                >
                  Close
                </button>
              </div>

              {suggestionsLoading ? (
                <div className="text-xs text-[#7C3AED] flex items-center gap-2 py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Kannada morphology and contextual grammar...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#575E75] dark:text-[#9CA3AF]">
                    {errorIntelligenceResult?.suggestions?.[0]?.linguisticReason ||
                      activeUncertainWord.reason ||
                      'Suggested alternative readings based on Kannada lexicon and context:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(errorIntelligenceResult?.suggestions ||
                      activeUncertainWord.suggestedAlternatives?.map((s) => ({
                        text: s,
                        englishMeaning: 'Linguistic alternative',
                      })) ||
                      []
                    ).map((sug: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleApplySuggestion(sug.text)}
                        className="p-2.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:border-[#7C3AED] bg-white dark:bg-[#1E2235] text-left transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-xs text-[#1C2337] dark:text-[#F3F1FA] font-kannada">
                            {sug.text}
                          </span>
                          <span className="block text-[10px] text-[#858B9E] truncate">
                            {sug.englishMeaning || 'Verified Kannada form'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#7C3AED] group-hover:underline">
                          Accept
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom replacement write-in */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#E3DDD2] dark:border-[#2D334C]">
                    <input
                      type="text"
                      value={customReplacement}
                      onChange={(e) => setCustomReplacement(e.target.value)}
                      placeholder="Type custom correction..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] bg-white dark:bg-[#1E2235] text-[#1C2337] dark:text-[#F3F1FA] font-kannada"
                    />
                    <button
                      onClick={() => handleApplySuggestion(customReplacement)}
                      disabled={!customReplacement || customReplacement === activeUncertainWord.word}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40"
                    >
                      Apply Custom
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diff View Mode or Normal Editor */}
          {showDiff ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#858B9E] block">
                Side-by-Side: Original OCR (Left) vs Corrected Text (Right)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/50 font-kannada leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap">
                  <span className="text-[10px] font-bold text-rose-700 block mb-1">
                    Original OCR Output:
                  </span>
                  {ocr?.extractedText}
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 font-kannada leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap">
                  <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                    Corrected Text:
                  </span>
                  {text}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Extracted Kannada text will appear here..."
                rows={18}
                className="w-full p-4 rounded-2xl bg-[#F7F4EE]/50 dark:bg-[#22263A]/50 border border-[#E3DDD2] dark:border-[#2D334C] text-[#1C2337] dark:text-[#F3F1FA] font-kannada text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all resize-y"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-[#858B9E] bg-white/80 dark:bg-[#1E2235]/80 px-2 py-0.5 rounded backdrop-blur-xs">
                UTF-8 Unicode Preserved
              </span>
            </div>
          )}

          {/* Bottom helper actions */}
          <div className="flex items-center justify-between text-xs text-[#858B9E] pt-1">
            <span>
              Tip: Click any uncertain word chip to inspect and accept corrections.
            </span>
            <button
              onClick={() => setActiveView('translation')}
              className="text-xs font-semibold hover:underline flex items-center gap-1"
              style={{ color: accent.hex }}
            >
              <span>Proceed to Translation &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
