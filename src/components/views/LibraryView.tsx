import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  Star,
  Trash2,
  ExternalLink,
  Filter,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
  Languages,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS, DOCUMENT_CATEGORIES } from '../../constants/accentColors';
import { DocumentCategory } from '../../types';

export const LibraryView: React.FC = () => {
  const {
    documents,
    activeDocument,
    selectDocument,
    deleteDocument,
    toggleFavourite,
    setActiveView,
    preferences,
    loadSampleDocument,
    isOnline,
  } = useApp();

  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavourites, setOnlyFavourites] = useState<boolean>(false);

  // Filter documents based on query, category, and favourites
  const filteredDocuments = documents.filter((doc) => {
    // 1. Favourites filter
    if (onlyFavourites && !doc.isFavourite) return false;

    // 2. Category filter
    if (selectedCategory !== 'all' && doc.documentCategory !== selectedCategory) return false;

    // 3. Search query across filename, extracted text, and translations
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = doc.filename.toLowerCase().includes(q);
      const inCategory = doc.documentCategory.toLowerCase().includes(q);

      const inOcr = doc.pages.some((p) => {
        const text = p.ocrResult?.correctedText || p.ocrResult?.extractedText || '';
        return text.toLowerCase().includes(q);
      });

      const inTranslations = Object.values(doc.translations || {}).some((t) =>
        t.translatedText.toLowerCase().includes(q)
      );

      return inName || inCategory || inOcr || inTranslations;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Search Bar & Filters */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#7C3AED]" />
              <span>Searchable Document Library</span>
              <span className="text-xs font-kannada font-normal text-[#858B9E]">(ದಾಖಲೆಗಳ ಭಂಡಾರ)</span>
            </h2>
            <p className="text-xs text-[#858B9E] mt-0.5">
              Cached locally in IndexedDB. Fully accessible offline for viewing, text editing, and search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('upload')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: accent.hex }}
            >
              Upload New Document
            </button>
          </div>
        </div>

        {/* Search input & category filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#858B9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Kannada keywords, filename, or translated text..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs sm:text-sm text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none cursor-pointer"
            >
              <option value="all">All Document Categories</option>
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.kannadaLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Favourite filter button */}
          <div className="sm:col-span-2">
            <button
              onClick={() => setOnlyFavourites(!onlyFavourites)}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                onlyFavourites
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                  : 'border-[#E3DDD2] dark:border-[#2E354D] bg-[#F7F4EE] dark:bg-[#22263A] text-[#575E75] dark:text-[#9CA3AF]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavourites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favourites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
          <FolderOpen className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
            No matching documents found
          </h3>
          <p className="text-xs text-[#858B9E] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or clear the filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyFavourites(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const page = doc.pages[0];
            const wordCount = page?.ocrResult?.wordCount || 0;
            const confidence = page?.ocrResult?.estimatedConfidence || 0;
            const translationCount = Object.keys(doc.translations || {}).length;
            const isSelected = activeDocument?.id === doc.id;

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#1E2235] border transition-all shadow-sm hover:shadow-md flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
                    : 'border-[#E3DDD2] dark:border-[#2D334C]'
                }`}
              >
                <div>
                  {/* Top row: favourite & category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1ECE2] dark:bg-[#282D44] text-[#575E75] dark:text-[#B1B7CC] truncate max-w-[170px]">
                      {doc.documentCategory}
                    </span>

                    <button
                      onClick={() => toggleFavourite(doc.id)}
                      className="p-1 rounded-full text-[#858B9E] hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          doc.isFavourite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Document Name */}
                  <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] truncate">
                    {doc.filename}
                  </h3>
                  <p className="text-[11px] text-[#858B9E] mt-0.5 flex items-center gap-2">
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{doc.fileSizeFormatted}</span>
                    <span>•</span>
                    <span>{doc.pageCount} page{doc.pageCount > 1 ? 's' : ''}</span>
                  </p>

                  {/* Document Preview Snippet */}
                  <div className="mt-3 p-3 rounded-2xl bg-[#F7F4EE]/60 dark:bg-[#22263A]/60 border border-[#E3DDD2] dark:border-[#2E354D] text-xs font-kannada text-[#575E75] dark:text-[#B1B7CC] line-clamp-3 leading-relaxed">
                    {page?.ocrResult?.correctedText || page?.ocrResult?.extractedText || 'Pending OCR extraction...'}
                  </div>

                  {/* Badges / Metrics */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                      {confidence}% Confidence
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold">
                      {wordCount} Words
                    </span>
                    {translationCount > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        <span>{translationCount} Translated</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#E3DDD2] dark:border-[#2D334C] flex items-center justify-between">
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 rounded-xl text-[#858B9E] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        selectDocument(doc.id);
                        setActiveView('restoration');
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        selectDocument(doc.id);
                        setActiveView('verification');
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-semibold text-white shadow-xs"
                      style={{ backgroundColor: accent.hex }}
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
