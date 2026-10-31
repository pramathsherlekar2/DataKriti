import React from 'react';
import {
  FileUp,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Compass,
} from 'lucide-react';
import { NavigationTab, useApp } from '../../context/AppContext';
import { ACCENT_COLORS, DOCUMENT_CATEGORIES } from '../../constants/accentColors';
import { DocumentCategory } from '../../types';

const VIEW_TITLES: Record<NavigationTab, { title: string; kannada: string; subtitle: string }> = {
  dashboard: {
    title: 'Command Dashboard',
    kannada: 'ಕೇಂದ್ರ ನಿಯಂತ್ರಣ ಫಲಕ',
    subtitle: 'Real-time overview of digitized Kannada documents and intelligence tasks',
  },
  upload: {
    title: 'Smart Document Upload & Ingestion',
    kannada: 'ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ ಮತ್ತು ಸ್ಕ್ಯಾನಿಂಗ್',
    subtitle: 'Upload printed, scanned, or handwritten Kannada files with multi-page support',
  },
  restoration: {
    title: 'Document Restoration Studio',
    kannada: 'ದಾಖಲೆ ಪುನಶ್ಚೇತನ ಕಾರ್ಯಾಗಾರ',
    subtitle: 'Physical condition assessment and real-time contrast/deskew enhancement',
  },
  verification: {
    title: 'OCR Verification & Text Editor',
    kannada: 'ಓಸಿಆರ್ ಪಠ್ಯ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಂಪಾದನೆ',
    subtitle: 'Side-by-side original image view, confidence heatmap, and error intelligence',
  },
  translation: {
    title: 'Multilingual Indian Translation',
    kannada: '೮ ಭಾರತೀಯ ಭಾಷೆಗಳಿಗೆ ಅನುವಾದ',
    subtitle: 'Translate Kannada into English, Marathi, Hindi, Punjabi, Gujarati, Telugu, Tamil, Malayalam',
  },
  intelligence: {
    title: 'AI Document Intelligence',
    kannada: 'ಬುದ್ಧಿವಂತ ಮಾಹಿತಿ ಹೊರತೆಗೆಯುವಿಕೆ',
    subtitle: 'Structured summary, entity extraction, and simple Kannada/English mode',
  },
  ask: {
    title: 'Ask Your Document',
    kannada: 'ದಾಖಲೆಯೊಂದಿಗೆ ಸಂವಾದ (ಪ್ರಶ್ನೋತ್ತರ)',
    subtitle: 'Conversational Q&A strictly grounded in document text with source citations',
  },
  voice: {
    title: 'Kannada Voice Reader',
    kannada: 'ಕನ್ನಡ ಧ್ವನಿ ವಾಚಕ (TTS)',
    subtitle: 'Natural text-to-speech reading with speed controls and sentence highlighting',
  },
  library: {
    title: 'Searchable Document Library',
    kannada: 'ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳ ಭಂಡಾರ',
    subtitle: 'Local search by Kannada/English keywords, categories, and date filters',
  },
  export: {
    title: 'Document Export Centre',
    kannada: 'ರಫ್ತು ಕೇಂದ್ರ (DOCX, PDF, TXT)',
    subtitle: 'Download verified Kannada Unicode in searchable PDF, docx, or raw text',
  },
  settings: {
    title: 'Settings & Design Customizer',
    kannada: 'ಸಂಯೋಜನೆಗಳು ಮತ್ತು ಬಣ್ಣಗಳು',
    subtitle: 'Switch between light/dark themes, customize 9 accent colors, and manage storage',
  },
};

interface HeaderProps {
  onOpenWelcome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWelcome }) => {
  const {
    activeView,
    activeDocument,
    documents,
    selectDocument,
    updateDocument,
    setActiveView,
    preferences,
    loadSampleDocument,
    toasts,
    dismissToast,
    isOnline,
  } = useApp();

  const currentViewMeta = VIEW_TITLES[activeView] || VIEW_TITLES.dashboard;
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (activeDocument) {
      updateDocument({
        ...activeDocument,
        documentCategory: e.target.value as DocumentCategory,
      });
    }
  };

  return (
    <header className="border-b border-[var(--header-border)] bg-[var(--header-background)] backdrop-blur-md px-6 py-3.5 sticky top-0 z-20">
      {/* Toast notifications float */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl shadow-lg border text-sm animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : 'bg-indigo-50 dark:bg-indigo-950/90 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{toast.message}</div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: View title, Kannada subtitle, and mobile compact brand logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('dashboard')}
            className="md:hidden flex items-center gap-2 cursor-pointer shrink-0"
            title="DataKriti Home"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[#E3DDD2] dark:border-[#2D334C] bg-white dark:bg-[#151827] shadow-2xs">
              <img
                src={preferences.theme === 'dark' ? '/assets/datakriti-icon-dark.png' : '/assets/datakriti-icon.png'}
                alt="DataKriti Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-sm text-[#222A48] dark:text-[#F3F1FA]">
              Data<span className="text-[#D6A76C] dark:text-[#E5BE84]">Kriti</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#1C2337] dark:text-[#F3F1FA]">
                {currentViewMeta.title}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-kannada bg-[#F1ECE2] dark:bg-[#282D44] text-[#7C3AED] dark:text-[#B7AAFF] font-medium">
                {currentViewMeta.kannada}
              </span>
            </div>
            <p className="text-xs text-[#858B9E] dark:text-[#949DB8] truncate max-w-xl">
              {currentViewMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Active Document Switcher & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active document selector if documents exist */}
          {documents.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[#858B9E] font-medium">Doc:</span>
              <select
                value={activeDocument?.id || ''}
                onChange={(e) => selectDocument(e.target.value)}
                className="bg-transparent font-medium text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#FFFFFF] dark:bg-[#1A1E2F]">
                    {d.filename}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Document Understanding Category picker if active document */}
          {activeDocument && (
            <div className="hidden lg:flex items-center gap-1 bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[#858B9E] font-medium">Mode:</span>
              <select
                value={activeDocument.documentCategory}
                onChange={handleCategoryChange}
                className="bg-transparent font-medium text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none cursor-pointer"
                title="Document Understanding Category"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key} className="bg-[#FFFFFF] dark:bg-[#1A1E2F]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick 1-Click Sample Loaders */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => loadSampleDocument(0)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#D6A76C]/40 text-[#1C2337] dark:text-[#F3F1FA] bg-[#D6A76C]/10 hover:bg-[#D6A76C]/20 transition-colors flex items-center gap-1"
              title="Load Karnataka Govt Circular Sample"
            >
              <span className="font-kannada">ಸುತ್ತೋಲೆ</span>
              <span className="hidden sm:inline text-[10px] opacity-75">Govt Order</span>
            </button>
            <button
              onClick={() => loadSampleDocument(1)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#A89BEA]/40 text-[#1C2337] dark:text-[#F3F1FA] bg-[#A89BEA]/10 hover:bg-[#A89BEA]/20 transition-colors flex items-center gap-1"
              title="Load Historical Inscription Sample"
            >
              <span className="font-kannada">ಶಾಸನ</span>
              <span className="hidden sm:inline text-[10px] opacity-75">Inscription</span>
            </button>
          </div>

          {/* New Document Button */}
          <button
            onClick={() => setActiveView('upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)' }}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>

          {/* Welcome & Brand Info Modal trigger */}
          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="p-1.5 rounded-xl border border-[#E3DDD2] dark:border-[#2E354D] bg-[#F7F4EE] dark:bg-[#22263A] hover:bg-[#F1ECE2] dark:hover:bg-[#282D44] text-[#7C3AED] dark:text-[#D6A76C] transition-colors"
              title="DataKriti Brand Overview & Sign In"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
