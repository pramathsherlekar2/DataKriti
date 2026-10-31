import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Sliders,
  X,
  File as FileIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS, DOCUMENT_CATEGORIES } from '../../constants/accentColors';
import { DocumentCategory, DocumentItem, DocumentPage } from '../../types';
import { assessDocumentRecovery, runKannadaOCR } from '../../services/api';

export const UploadView: React.FC = () => {
  const { addDocument, setActiveView, preferences, showToast, isOnline, loadSampleDocument } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDataUrls, setFileDataUrls] = useState<string[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<DocumentCategory>('Government Document');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Camera state
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate a PDF preview thumbnail on canvas
  const createPdfThumbnail = (filename: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#1E243D';
    ctx.fillRect(0, 0, 400, 550);

    // Border
    ctx.strokeStyle = '#D6A76C';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 368, 518);

    // PDF badge
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(40, 40, 60, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PDF', 58, 56);

    // File name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Noto Sans Kannada", sans-serif';
    ctx.fillText('ಕನ್ನಡ PDF ದಾಖಲೆ', 40, 110);

    ctx.fillStyle = '#949DB8';
    ctx.font = '12px sans-serif';
    ctx.fillText(filename.length > 25 ? filename.slice(0, 22) + '...' : filename, 40, 135);

    // Document mock lines
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let y = 180; y < 460; y += 24) {
      ctx.fillRect(40, y, Math.random() * 150 + 170, 8);
    }

    ctx.fillStyle = '#D6A76C';
    ctx.font = '11px "Noto Sans Kannada", sans-serif';
    ctx.fillText('DataKriti Multimodal PDF Ingestion', 40, 490);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Validate and read files as real Base64 Data URLs
  const validateAndAddFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validFormats.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
        setErrorMsg(`"${file.name}" has an unsupported format. Please upload JPG, PNG, or PDF.`);
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 20MB maximum file size limit.`);
        return;
      }
      newFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Read real base64 data URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setFileDataUrls((prev) => [...prev, dataUrl]);

          if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            const thumb = createPdfThumbnail(file.name);
            setThumbnailUrls((prev) => [...prev, thumb || dataUrl]);
          } else {
            setThumbnailUrls((prev) => [...prev, dataUrl]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Live Camera Handlers
  const startLiveCamera = async () => {
    setErrorMsg(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        setShowCameraModal(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
      } else {
        // Fallback to camera file input
        cameraInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Live webcam error:', err);
      // Fallback to camera input
      cameraInputRef.current?.click();
    }
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Convert dataUrl to a File object
    const photoFile = new File(
      [photoDataUrl],
      `Kannada_Camera_Capture_${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    );

    setSelectedFiles((prev) => [...prev, photoFile]);
    setFileDataUrls((prev) => [...prev, photoDataUrl]);
    setThumbnailUrls((prev) => [...prev, photoDataUrl]);

    closeCameraModal();
    showToast('Photo captured successfully!', 'success');
  };

  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileDataUrls((prev) => prev.filter((_, i) => i !== index));
    setThumbnailUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setFileDataUrls([]);
    setThumbnailUrls([]);
    setErrorMsg(null);
  };

  // Initiate AI Digitization (Recovery Assessment + OCR)
  const handleDigitize = async () => {
    if (selectedFiles.length === 0 || fileDataUrls.length === 0) {
      setErrorMsg('Please upload at least one Kannada document before digitizing.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const firstFile = selectedFiles[0];
      const firstDataUrl = fileDataUrls[0];
      const isPdf = firstFile.type.includes('pdf') || firstFile.name.endsWith('.pdf');
      const mimeType = isPdf ? 'application/pdf' : firstFile.type || 'image/jpeg';

      // 1. Recovery Assessment
      setProcessingStage('Assessing document condition & Kannada ligature clarity...');
      let assessment;
      try {
        assessment = await assessDocumentRecovery(
          firstDataUrl,
          firstFile.name,
          mimeType
        );
      } catch (err: any) {
        console.warn('Condition assessment note:', err);
      }

      // 2. Multimodal Kannada OCR
      setProcessingStage('Running AI-powered Kannada OCR Engine (preserving Unicode & ottakshara)...');
      let ocrResult;
      try {
        ocrResult = await runKannadaOCR(
          firstDataUrl,
          category,
          1,
          mimeType
        );
      } catch (err: any) {
        throw new Error(`Kannada OCR failed: ${err.message}`);
      }

      // Construct pages
      const pages: DocumentPage[] = fileDataUrls.map((dataUrl, idx) => ({
        pageNumber: idx + 1,
        originalImage: dataUrl,
        ocrResult: idx === 0 ? ocrResult : undefined,
      }));

      // Construct Document Item
      const newDoc: DocumentItem = {
        id: 'doc-' + Date.now().toString(36),
        filename: firstFile.name,
        fileType: mimeType,
        uploadDate: new Date().toISOString(),
        fileSizeFormatted: `${(firstFile.size / (1024 * 1024)).toFixed(1)} MB`,
        pageCount: pages.length,
        documentCategory: category,
        processingStatus: 'ready',
        pages,
        currentPageIndex: 0,
        recoveryAssessment: assessment,
        translations: {},
        summaries: {},
        chatHistory: [],
      };

      await addDocument(newDoc);
      showToast('Document digitized successfully!', 'success');

      if (assessment && (assessment.overallCondition === 'Degraded' || assessment.qualityScore < 75)) {
        setActiveView('restoration');
        showToast('Document has degraded quality. Opened Restoration Studio.', 'info');
      } else {
        setActiveView('verification');
      }
    } catch (err: any) {
      console.error('Digitization failed:', err);
      setErrorMsg(err.message || 'Failed to digitize document. Please check connection and try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Live Webcam Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2235] border border-[#2D334C] rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="w-4 h-4 text-[#7C3AED]" />
                <span>Live Document Camera Capture</span>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">Position Kannada document within frame</span>
              <button
                onClick={captureLivePhoto}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: accent.hex }}
              >
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#7C3AED]" />
              <span>Smart Document Ingestion</span>
              <span className="text-sm font-normal font-kannada text-[#858B9E]">(ಅಪ್‌ಲೋಡ್)</span>
            </h2>
            <p className="text-xs text-[#575E75] dark:text-[#9CA3AF] mt-1 max-w-xl">
              Supports scanned Kannada gazettes, official letters, university question papers, and
              historical texts in JPG, PNG, and PDF formats up to 20MB.
            </p>
          </div>

          {/* 1-Click Sample Pill CTA */}
          <div className="flex items-center gap-2 bg-[#F7F4EE] dark:bg-[#22263A] p-2 rounded-2xl border border-[#E3DDD2] dark:border-[#2E354D]">
            <span className="text-xs font-medium text-[#575E75] dark:text-[#9CA3AF] px-1">
              Try Sample:
            </span>
            <button
              onClick={() => loadSampleDocument(0)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
            >
              Govt Order
            </button>
            <button
              onClick={() => loadSampleDocument(1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Old Inscription
            </button>
          </div>
        </div>

        {/* Document Understanding Category Selection */}
        <div className="mt-5 pt-4 border-t border-[#E3DDD2] dark:border-[#2D334C]">
          <label className="block text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA] mb-2">
            Select Document Category Context (ದಾಖಲೆಯ ವರ್ಗ):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DOCUMENT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    isSelected
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#B7AAFF] font-semibold ring-1 ring-[#7C3AED]'
                      : 'border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] text-[#575E75] dark:text-[#9CA3AF]'
                  }`}
                >
                  <p className="truncate font-medium">{cat.label}</p>
                  <p className="text-[10px] opacity-75 font-kannada truncate">{cat.kannadaLabel}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white dark:bg-[#1E2235] ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
            : 'border-[#CEC5B8] dark:border-[#3F4667] hover:border-[#7C3AED]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#7C3AED] dark:text-[#A89BEA] flex items-center justify-center mx-auto mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
          Drag and drop Kannada document images or PDF here
        </h3>
        <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1">
          Supports JPG, PNG, and PDF documents up to 20MB
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl font-medium text-xs shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)' }}
          >
            Browse Computer Files
          </button>

          <button
            type="button"
            onClick={startLiveCamera}
            className="px-4 py-2.5 rounded-xl font-medium text-xs border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] text-[#1C2337] dark:text-[#F3F1FA] transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-[#7C3AED]" />
            <span>Camera Capture</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Files Previews & Multi-page Navigator */}
      {selectedFiles.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C3AED]" />
              <span>
                Selected Documents ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''})
              </span>
            </h3>
            <button
              onClick={clearAll}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {thumbnailUrls.map((thumb, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-[#E3DDD2] dark:border-[#2D334C] bg-[#F7F4EE] dark:bg-[#22263A] aspect-[3/4]"
              >
                <img
                  src={thumb}
                  alt={`Document Page ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-white">
                  Page {idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Prominent Digitize Action */}
          <div className="pt-4 border-t border-[#E3DDD2] dark:border-[#2D334C] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#858B9E] dark:text-[#9CA3AF]">
              File: <strong className="text-[#1C2337] dark:text-[#F3F1FA]">{selectedFiles[0]?.name}</strong> ({((selectedFiles[0]?.size || 0) / 1024).toFixed(0)} KB)
            </div>

            <button
              onClick={handleDigitize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)' }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{processingStage || 'Processing with Gemini Vision...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Kannada Digitization</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
