import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  RotateCw,
  Sun,
  Contrast,
  Split,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import {
  applyImageEnhancements,
  defaultEnhancementOptions,
  EnhancementOptions,
} from '../../services/imageEnhancement';
import { assessDocumentRecovery, runKannadaOCR } from '../../services/api';

export const RestorationStudioView: React.FC = () => {
  const { activeDocument, updateDocument, setActiveView, preferences, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const originalImage = page?.originalImage || '';
  const [enhancedPreview, setEnhancedPreview] = useState<string>(
    page?.enhancedImage || page?.originalImage || ''
  );

  const [options, setOptions] = useState<EnhancementOptions>(
    activeDocument?.enhancementFilters || defaultEnhancementOptions
  );

  const [compareMode, setCompareMode] = useState<'side-by-side' | 'split' | 'enhanced-only'>('split');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [isReRunningOcr, setIsReRunningOcr] = useState<boolean>(false);

  // Sync enhanced preview when options or active page change
  useEffect(() => {
    if (!originalImage) return;

    let isMounted = true;
    setIsEnhancing(true);

    const timer = setTimeout(() => {
      applyImageEnhancements(originalImage, options)
        .then((result) => {
          if (isMounted) {
            setEnhancedPreview(result);
            setIsEnhancing(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsEnhancing(false);
        });
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [originalImage, options]);

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <Sliders className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Upload a Kannada document to begin image restoration and enhancement.</p>
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

  const assessment = activeDocument.recoveryAssessment;

  // Run or re-run Recovery Intelligence condition assessment
  const handleAssessCondition = async () => {
    setIsAssessing(true);
    try {
      const result = await assessDocumentRecovery(
        enhancedPreview || originalImage,
        activeDocument.filename
      );
      const updatedDoc = {
        ...activeDocument,
        recoveryAssessment: result,
      };
      await updateDocument(updatedDoc);
      showToast('Document quality assessment completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to assess document condition', 'error');
    } finally {
      setIsAssessing(false);
    }
  };

  // 1-Click Automatic Recovery Application
  const handleApplyRecommendedAutoFix = () => {
    if (!assessment || !assessment.recommendedEnhancements) {
      // General adaptive defaults for Kannada manuscripts
      setOptions({
        ...defaultEnhancementOptions,
        contrast: 28,
        brightness: 8,
        sharpen: 35,
        fadedTextEnhance: true,
        shadowReduction: true,
      });
      showToast('Applied adaptive contrast & shadow recovery for Kannada script', 'info');
      return;
    }

    const newOptions: EnhancementOptions = { ...defaultEnhancementOptions };
    assessment.recommendedEnhancements.forEach((enh) => {
      if (enh.operation === 'contrast') newOptions.contrast = enh.suggestedValue || 25;
      if (enh.operation === 'brightness') newOptions.brightness = enh.suggestedValue || 10;
      if (enh.operation === 'sharpen') newOptions.sharpen = enh.suggestedValue || 30;
      if (enh.operation === 'deskew') newOptions.deskew = enh.suggestedValue || 0;
      if (enh.operation === 'shadow_removal') newOptions.shadowReduction = true;
    });

    if (assessment.contrastQuality === 'Faded' || assessment.contrastQuality === 'Critically Low') {
      newOptions.fadedTextEnhance = true;
    }

    setOptions(newOptions);
    showToast('Applied recommended AI restoration settings!', 'success');
  };

  const handleReset = () => {
    setOptions(defaultEnhancementOptions);
  };

  // Save enhanced image to document
  const handleSaveEnhancedImage = async () => {
    const updatedPages = [...activeDocument.pages];
    updatedPages[activeDocument.currentPageIndex] = {
      ...page,
      enhancedImage: enhancedPreview,
    };

    const updatedDoc = {
      ...activeDocument,
      pages: updatedPages,
      enhancementFilters: options,
    };

    await updateDocument(updatedDoc);
    showToast('Enhanced image saved! You can now use it for OCR verification.', 'success');
  };

  // Re-run Kannada OCR on the enhanced image
  const handleReRunOcr = async () => {
    setIsReRunningOcr(true);
    try {
      showToast('Re-running Kannada OCR on enhanced image...', 'info');
      const ocrResult = await runKannadaOCR(
        enhancedPreview,
        activeDocument.documentCategory,
        page.pageNumber
      );

      const updatedPages = [...activeDocument.pages];
      updatedPages[activeDocument.currentPageIndex] = {
        ...page,
        enhancedImage: enhancedPreview,
        ocrResult,
      };

      const updatedDoc = {
        ...activeDocument,
        pages: updatedPages,
        enhancementFilters: options,
      };

      await updateDocument(updatedDoc);
      showToast('OCR completed with enhanced image! Opening verification editor.', 'success');
      setActiveView('verification');
    } catch (err: any) {
      showToast(err.message || 'OCR re-run failed', 'error');
    } finally {
      setIsReRunningOcr(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Recovery Condition Assessment Card (Feature 13) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                Kannada Document Recovery Intelligence
              </h2>
              <span className="text-xs font-kannada font-normal text-[#858B9E]">
                (ಗುಣಮಟ್ಟ ವಿಶ್ಲೇಷಣೆ)
              </span>
            </div>
            <p className="text-xs text-[#575E75] dark:text-[#9CA3AF] mt-1">
              AI evaluates physical condition: blur, fading, shadows, skew, and diacritic readability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAssessCondition}
              disabled={isAssessing}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAssessing ? 'animate-spin' : ''}`} />
              <span>{isAssessing ? 'Assessing...' : 'Re-assess Quality'}</span>
            </button>

            <button
              onClick={handleApplyRecommendedAutoFix}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: accent.hex }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Restore (ಶಿಫಾರಸು ಮಾಡಿದ ಪುನಶ್ಚೇತನ)</span>
            </button>
          </div>
        </div>

        {assessment ? (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A]">
              <span className="text-[10px] uppercase font-semibold text-[#858B9E]">Quality Score</span>
              <div className="text-xl font-bold mt-0.5 text-[#1C2337] dark:text-[#F3F1FA] flex items-baseline gap-1">
                <span>{assessment.qualityScore}</span>
                <span className="text-xs font-normal text-[#858B9E]">/ 100</span>
              </div>
              <span
                className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  assessment.qualityScore >= 80
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : assessment.qualityScore >= 60
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-rose-500/10 text-rose-600'
                }`}
              >
                {assessment.overallCondition}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A]">
              <span className="text-[10px] uppercase font-semibold text-[#858B9E]">Contrast Quality</span>
              <div className="text-sm font-bold mt-1 text-[#1C2337] dark:text-[#F3F1FA]">
                {assessment.contrastQuality}
              </div>
              <span className="text-[10px] text-[#858B9E] mt-1 block">Ink vs Background</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A]">
              <span className="text-[10px] uppercase font-semibold text-[#858B9E]">Blur Level</span>
              <div className="text-sm font-bold mt-1 text-[#1C2337] dark:text-[#F3F1FA]">
                {assessment.blurLevel}
              </div>
              <span className="text-[10px] text-[#858B9E] mt-1 block">Glyph Edge Focus</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A]">
              <span className="text-[10px] uppercase font-semibold text-[#858B9E]">Estimated Skew</span>
              <div className="text-sm font-bold mt-1 text-[#1C2337] dark:text-[#F3F1FA]">
                {assessment.skewAngleEstimateDegrees !== undefined
                  ? `${assessment.skewAngleEstimateDegrees}°`
                  : '0°'}
              </div>
              <span className="text-[10px] text-[#858B9E] mt-1 block">Orientation alignment</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A]">
              <span className="text-[10px] uppercase font-semibold text-[#858B9E]">Lighting Field</span>
              <div className="text-sm font-bold mt-1 text-[#1C2337] dark:text-[#F3F1FA]">
                {assessment.lightingUniformity || 'Uniform'}
              </div>
              <span className="text-[10px] text-[#858B9E] mt-1 block">Shadow Distribution</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <span>No condition assessment recorded yet. Click &quot;Re-assess Quality&quot; to run vision evaluation.</span>
            <button
              onClick={handleAssessCondition}
              className="font-bold underline ml-2"
            >
              Analyze Now
            </button>
          </div>
        )}

        {/* Detected issues list */}
        {assessment?.detectedIssues && assessment.detectedIssues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E3DDD2] dark:border-[#2D334C] space-y-2">
            <h4 className="text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
              Detected Physical/Capture Defects:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {assessment.detectedIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      {issue.issue}
                    </span>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      {issue.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Studio: Canvas Preview (Left) + Enhancement Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document View (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
                Compare View:
              </span>
              <div className="inline-flex rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] p-1 border border-[#E3DDD2] dark:border-[#2D334C] text-xs">
                <button
                  onClick={() => setCompareMode('split')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    compareMode === 'split' ? 'bg-white dark:bg-[#1A1E2F] shadow-xs font-bold' : ''
                  }`}
                >
                  Split Slider
                </button>
                <button
                  onClick={() => setCompareMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    compareMode === 'side-by-side' ? 'bg-white dark:bg-[#1A1E2F] shadow-xs font-bold' : ''
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setCompareMode('enhanced-only')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    compareMode === 'enhanced-only' ? 'bg-white dark:bg-[#1A1E2F] shadow-xs font-bold' : ''
                  }`}
                >
                  Enhanced Only
                </button>
              </div>
            </div>

            {isEnhancing && (
              <span className="text-xs text-[#7C3AED] dark:text-[#B7AAFF] font-medium flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Applying filters...</span>
              </span>
            )}
          </div>

          {/* Interactive Comparison Canvas Area */}
          <div className="relative min-h-[500px] max-h-[700px] overflow-hidden rounded-2xl bg-[#1C2337]/5 dark:bg-black/30 border border-[#E3DDD2] dark:border-[#2D334C] flex items-center justify-center p-3 select-none">
            {compareMode === 'split' && (
              <div className="relative w-full max-w-[650px] aspect-[3/4] overflow-hidden rounded-xl shadow-lg border border-black/10">
                {/* Enhanced Image on bottom layer */}
                <img
                  src={enhancedPreview}
                  alt="Enhanced Kannada Document"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Original Image clipped by split percentage */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${splitPosition}%` }}
                >
                  <img
                    src={originalImage}
                    alt="Original Kannada Document"
                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                    Original (ಮೂಲ)
                  </div>
                </div>

                {/* Split Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-md"
                  style={{ left: `${splitPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1E2235] border-2 border-[#7C3AED] shadow-md flex items-center justify-center text-[10px] font-bold text-[#7C3AED]">
                    <Split className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#7C3AED]/90 text-white text-[10px] font-semibold">
                  Enhanced (ಪುನಶ್ಚೇತನ)
                </div>

                {/* Hidden slider input overlay for drag control */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPosition}
                  onChange={(e) => setSplitPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
              </div>
            )}

            {compareMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-4 w-full h-full">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-[#858B9E] mb-1">
                    Original Document (ಮೂಲ ದಾಖಲೆ)
                  </span>
                  <div className="relative aspect-[3/4] max-h-[560px] rounded-xl overflow-hidden shadow-sm border border-black/10">
                    <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-[#7C3AED] dark:text-[#B7AAFF] mb-1">
                    Enhanced Document (ಪುನಶ್ಚೇತನ)
                  </span>
                  <div className="relative aspect-[3/4] max-h-[560px] rounded-xl overflow-hidden shadow-sm border border-[#7C3AED]/30 ring-1 ring-[#7C3AED]/40">
                    <img src={enhancedPreview} alt="Enhanced" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )}

            {compareMode === 'enhanced-only' && (
              <div className="relative max-w-[650px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-[#7C3AED]/30">
                <img src={enhancedPreview} alt="Enhanced" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* Action buttons under canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="text-xs text-[#858B9E] font-medium">
              Page {activeDocument.currentPageIndex + 1} of {activeDocument.pageCount}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEnhancedImage}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors text-[#1C2337] dark:text-[#F3F1FA]"
              >
                Save Enhanced Image
              </button>

              <button
                onClick={handleReRunOcr}
                disabled={isReRunningOcr}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: accent.hex }}
              >
                {isReRunningOcr ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing OCR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run OCR with Enhanced Image</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Enhancement Controls & Sliders (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#E3DDD2] dark:border-[#2D334C] pb-3">
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#7C3AED]" />
              <span>Restoration Controls</span>
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-[#858B9E] hover:text-[#1C2337] dark:hover:text-white flex items-center gap-1"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#858B9E] block">Intelligent Modes:</span>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] cursor-pointer text-xs">
              <div>
                <span className="font-semibold text-[#1C2337] dark:text-[#F3F1FA] block">
                  Faded-Text Recovery
                </span>
                <span className="text-[10px] text-[#858B9E]">Darken faint Kannada strokes</span>
              </div>
              <input
                type="checkbox"
                checked={options.fadedTextEnhance}
                onChange={(e) => setOptions({ ...options, fadedTextEnhance: e.target.checked })}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] cursor-pointer text-xs">
              <div>
                <span className="font-semibold text-[#1C2337] dark:text-[#F3F1FA] block">
                  Shadow Reduction
                </span>
                <span className="text-[10px] text-[#858B9E]">Remove uneven lighting & phone shadows</span>
              </div>
              <input
                type="checkbox"
                checked={options.shadowReduction}
                onChange={(e) => setOptions({ ...options, shadowReduction: e.target.checked })}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] cursor-pointer text-xs">
              <div>
                <span className="font-semibold text-[#1C2337] dark:text-[#F3F1FA] block">
                  Grayscale Mode
                </span>
                <span className="text-[10px] text-[#858B9E]">Eliminate paper discoloration</span>
              </div>
              <input
                type="checkbox"
                checked={options.grayscale}
                onChange={(e) => setOptions({ ...options, grayscale: e.target.checked })}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Granular Sliders */}
          <div className="space-y-4 pt-2 border-t border-[#E3DDD2] dark:border-[#2D334C]">
            <span className="text-xs font-semibold text-[#858B9E] block">Fine-Tuning Sliders:</span>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#1C2337] dark:text-[#F3F1FA]">Contrast:</span>
                <span className="font-mono text-[11px] font-semibold">{options.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={options.contrast}
                onChange={(e) => setOptions({ ...options, contrast: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#1C2337] dark:text-[#F3F1FA]">Brightness:</span>
                <span className="font-mono text-[11px] font-semibold">{options.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={options.brightness}
                onChange={(e) => setOptions({ ...options, brightness: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>

            {/* Sharpening */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#1C2337] dark:text-[#F3F1FA]">Sharpening:</span>
                <span className="font-mono text-[11px] font-semibold">{options.sharpen}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.sharpen}
                onChange={(e) => setOptions({ ...options, sharpen: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>

            {/* Rotation / Deskew */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#1C2337] dark:text-[#F3F1FA]">Deskew Angle:</span>
                <span className="font-mono text-[11px] font-semibold">{options.deskew}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={options.deskew}
                onChange={(e) => setOptions({ ...options, deskew: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
