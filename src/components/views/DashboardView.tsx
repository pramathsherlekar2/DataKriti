import React from 'react';
import {
  FileText,
  Sliders,
  CheckCircle,
  Languages,
  Sparkles,
  MessageSquare,
  GitCompare,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';

export const DashboardView: React.FC = () => {
  const {
    documents,
    activeDocument,
    selectDocument,
    setActiveView,
    preferences,
    loadSampleDocument,
    toggleFavourite,
    isOnline,
  } = useApp();

  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  // Real statistics derived from database
  const totalDocuments = documents.length;
  const totalWords = documents.reduce((acc, d) => {
    const pageWords = d.pages.reduce((pAcc, p) => pAcc + (p.ocrResult?.wordCount || 0), 0);
    return acc + pageWords;
  }, 0);

  const confidenceSum = documents.reduce((acc, d) => {
    const pageConf = d.pages.reduce((pAcc, p) => pAcc + (p.ocrResult?.estimatedConfidence || 0), 0);
    return acc + (d.pages.length > 0 ? pageConf / d.pages.length : 0);
  }, 0);
  const avgConfidence = totalDocuments > 0 ? Math.round(confidenceSum / totalDocuments) : 0;

  const totalTranslations = documents.reduce(
    (acc, d) => acc + Object.keys(d.translations || {}).length,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner with Official Brand Artwork */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1E243D] via-[#222A48] to-[#121626] text-white shadow-xl border border-white/15">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#D6A76C] border border-[#D6A76C]/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Kannada AI Document Intelligence Platform</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans">
              Data<span className="text-[#D6A76C]">Kriti</span>
              <span className="block text-base sm:text-xl font-normal text-white/80 mt-1 font-kannada">
                ಕನ್ನಡ ದಾಖಲೆಗಳಿಂದ ಡಿಜಿಟಲ್ ಜ್ಞಾನದೆಡೆಗೆ
              </span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              From Kannada Documents to Digital Knowledge. Convert printed, scanned, and handwritten Kannada documents into verified, searchable, and editable digital information.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('upload')}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)' }}
              >
                <FileText className="w-4 h-4" />
                <span>Digitize New Document</span>
              </button>

              <button
                onClick={() => loadSampleDocument(0)}
                className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-white/15 hover:bg-white/20 text-white backdrop-blur-md transition-colors flex items-center gap-2"
              >
                <span>Load Govt Circular Sample</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D6A76C]" />
              </button>
            </div>
          </div>

          {/* Official Full Logo Display Card */}
          <div className="shrink-0 self-center lg:self-auto flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg max-w-[280px]">
            <img
              src="/assets/datakriti-logo-dark.png"
              alt="DataKriti Official Brand Identity"
              className="w-full h-auto object-contain rounded-xl"
            />
            <span className="text-[10px] tracking-wider uppercase text-[#D6A76C] font-bold mt-2 font-mono">
              Official Brand Identity
            </span>
          </div>
        </div>

        {/* Decorative subtle lotus watermark */}
        <div className="absolute -right-6 -bottom-8 opacity-5 select-none pointer-events-none">
          <img src="/assets/datakriti-icon.png" alt="" className="w-80 h-80 object-contain" />
        </div>
      </div>

      {/* Real Real-time Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
          <div className="flex items-center justify-between text-[#858B9E] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Saved Documents</span>
            <FolderOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1C2337] dark:text-[#F3F1FA]">
            {totalDocuments}
          </div>
          <div className="mt-1 text-[11px] text-[#575E75] dark:text-[#9CA3AF] flex items-center gap-1 font-kannada">
            <span>ಸಂಗ್ರಹಿತ ದಾಖಲೆಗಳು</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
          <div className="flex items-center justify-between text-[#858B9E] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Kannada Words Digitized</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1C2337] dark:text-[#F3F1FA]">
            {totalWords.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#575E75] dark:text-[#9CA3AF] flex items-center gap-1 font-kannada">
            <span>ಡಿಜಿಟಲೀಕರಿಸಿದ ಪದಗಳು</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
          <div className="flex items-center justify-between text-[#858B9E] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Avg Readability Confidence</span>
            <ShieldCheck className="w-4 h-4 text-[#D6A76C]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1C2337] dark:text-[#F3F1FA]">
            {avgConfidence > 0 ? `${avgConfidence}%` : 'N/A'}
          </div>
          <div className="mt-1 text-[11px] text-[#575E75] dark:text-[#9CA3AF] flex items-center gap-1 font-kannada">
            <span>ಸರಾಸರಿ ನಿಖರತೆ ಸೂಚ್ಯಂಕ</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
          <div className="flex items-center justify-between text-[#858B9E] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Generated Translations</span>
            <Languages className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1C2337] dark:text-[#F3F1FA]">
            {totalTranslations}
          </div>
          <div className="mt-1 text-[11px] text-[#575E75] dark:text-[#9CA3AF] flex items-center gap-1 font-kannada">
            <span>೮ ಭಾರತೀಯ ಭಾಷೆಗಳಿಗೆ</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Workspaces */}
      <div>
        <h2 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA] mb-3 flex items-center gap-2">
          <span>Core Intelligence Workspaces</span>
          <span className="text-xs font-kannada font-normal text-[#858B9E]">(ಕಾರ್ಯಕ್ಷೇತ್ರಗಳು)</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <button
            onClick={() => setActiveView('restoration')}
            className="p-4 rounded-2xl text-left bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-md group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">Restoration Studio</h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1 font-kannada">ಚಿತ್ರ ಪುನಶ್ಚೇತನ</p>
            <span className="inline-block mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Recover faded text &rarr;
            </span>
          </button>

          <button
            onClick={() => setActiveView('verification')}
            className="p-4 rounded-2xl text-left bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-emerald-400 dark:hover:border-emerald-500 transition-all hover:shadow-md group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">OCR Verification</h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1 font-kannada">ಪಠ್ಯ ದೃಢೀಕರಣ</p>
            <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Side-by-side editor &rarr;
            </span>
          </button>

          <button
            onClick={() => setActiveView('ask')}
            className="p-4 rounded-2xl text-left bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-md group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">Ask Your Document</h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1 font-kannada">ಪ್ರಶ್ನೋತ್ತರ ಸಂವಾದ</p>
            <span className="inline-block mt-2 text-[11px] font-medium text-purple-600 dark:text-purple-400">
              Grounded AI answers &rarr;
            </span>
          </button>

          <button
            onClick={() => setActiveView('comparison')}
            className="p-4 rounded-2xl text-left bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">Document Comparison</h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1 font-kannada">ದಾಖಲೆ ಹೋಲಿಕೆ</p>
            <span className="inline-block mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Diff & change detection &rarr;
            </span>
          </button>

          <button
            onClick={() => setActiveView('authenticity')}
            className="p-4 rounded-2xl text-left bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-rose-400 dark:hover:border-rose-500 transition-all hover:shadow-md group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#1C2337] dark:text-[#F3F1FA]">Authenticity & Tampering</h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF] mt-1 font-kannada">ದೃಢೀಕರಣ ತಪಾಸಣೆ</p>
            <span className="inline-block mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              Forensic inspection &rarr;
            </span>
          </button>
        </div>
      </div>

      {/* Recent Documents Table & Highlights */}
      <div className="bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-[#1C2337] dark:text-[#F3F1FA]">
              Recent Kannada Documents
            </h3>
            <p className="text-xs text-[#858B9E] dark:text-[#9CA3AF]">
              All processed files are stored safely in local browser storage (IndexedDB)
            </p>
          </div>

          <button
            onClick={() => setActiveView('library')}
            className="text-xs font-semibold hover:underline flex items-center gap-1"
            style={{ color: accent.hex }}
          >
            <span>View All in Library</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
            <p className="text-sm font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
              No documents uploaded yet
            </p>
            <p className="text-xs text-[#858B9E] mt-1">
              Upload your first Kannada document or load one of our official sample documents.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setActiveView('upload')}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white shadow-sm"
                style={{ backgroundColor: accent.hex }}
              >
                Upload Document
              </button>
              <button
                onClick={() => loadSampleDocument(0)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#F1ECE2] dark:bg-[#282D44] text-[#1C2337] dark:text-white"
              >
                Load Sample
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E3DDD2] dark:border-[#2D334C] text-[#858B9E] dark:text-[#9CA3AF] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3 pl-2">Document Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Words</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DDD2]/60 dark:divide-[#2D334C]/60">
                {documents.slice(0, 5).map((doc) => {
                  const isSelected = activeDocument?.id === doc.id;
                  const wordCount = doc.pages[0]?.ocrResult?.wordCount || 0;
                  const confidence = doc.pages[0]?.ocrResult?.estimatedConfidence || 0;

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavourite(doc.id)}
                            className="text-[#858B9E] hover:text-amber-500 transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                doc.isFavourite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                          <div>
                            <span className="font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
                              {doc.filename}
                            </span>
                            <span className="block text-[10px] text-[#858B9E] font-kannada">
                              {doc.documentCategory}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1ECE2] dark:bg-[#282D44] text-[#575E75] dark:text-[#B1B7CC]">
                          {doc.documentCategory}
                        </span>
                      </td>

                      <td className="py-3 font-medium text-[#1C2337] dark:text-[#F3F1FA]">
                        {wordCount > 0 ? `${wordCount} words` : 'Pending'}
                      </td>

                      <td className="py-3">
                        {confidence > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                confidence >= 90
                                  ? 'bg-emerald-500'
                                  : confidence >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="font-medium text-[#1C2337] dark:text-[#F3F1FA]">
                              {confidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#858B9E]">--</span>
                        )}
                      </td>

                      <td className="py-3 text-[#858B9E]">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              selectDocument(doc.id);
                              setActiveView('verification');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 text-[#1C2337] dark:text-[#F3F1FA]"
                          >
                            Verify OCR
                          </button>
                          <button
                            onClick={() => {
                              selectDocument(doc.id);
                              setActiveView('ask');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-white shadow-xs"
                            style={{ backgroundColor: accent.hex }}
                          >
                            Ask AI
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
