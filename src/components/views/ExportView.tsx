import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Languages,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import {
  exportAsDocx,
  exportAsSearchablePdf,
  exportAsText,
  exportTranslationText,
} from '../../services/exportService';

export const ExportView: React.FC = () => {
  const { activeDocument, preferences, setActiveView, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [useCorrectedText, setUseCorrectedText] = useState<boolean>(true);
  const [selectedExportLang, setSelectedExportLang] = useState<string>('English');

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const ocrText = (useCorrectedText && page?.ocrResult?.correctedText)
    ? page.ocrResult.correctedText
    : page?.ocrResult?.extractedText || '';

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <Download className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Upload a Kannada document or load a sample to export verified files.</p>
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

  const handleExportTxt = () => {
    exportAsText(activeDocument, useCorrectedText);
    showToast('Downloaded verified text as UTF-8 TXT', 'success');
  };

  const handleExportDocx = () => {
    exportAsDocx(activeDocument, useCorrectedText);
    showToast('Downloaded document as DOCX', 'success');
  };

  const handleExportPdf = async () => {
    await exportAsSearchablePdf(activeDocument, useCorrectedText);
    showToast('Generated Searchable PDF with Kannada text layer', 'success');
  };

  const handleExportTranslation = (lang: string) => {
    exportTranslationText(activeDocument, lang);
    showToast(`Exported ${lang} translation`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#7C3AED]" />
              <span>Document Export Centre</span>
              <span className="text-xs font-kannada font-normal text-[#858B9E]">(ರಫ್ತು ಕೇಂದ್ರ)</span>
            </h2>
            <p className="text-xs text-[#858B9E] mt-0.5">
              Export verified Kannada Unicode text, structured reports, searchable PDFs, and multi-language translations.
            </p>
          </div>

          {/* Toggle between corrected vs raw OCR */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={useCorrectedText}
              onChange={(e) => setUseCorrectedText(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C3AED] focus:ring-0"
            />
            <span className="font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
              Export Verified/Corrected Text
            </span>
          </label>
        </div>
      </div>

      {/* 3 Main Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Format 1: Searchable PDF */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex flex-col justify-between group hover:border-[#7C3AED] transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <File className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1C2337] dark:text-[#F3F1FA]">
              Searchable PDF Document
            </h3>
            <p className="text-xs text-[#858B9E] mt-1.5 leading-relaxed">
              Generates an archival PDF with a selectable and searchable Kannada digital text layer, document header, and image embedding.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-[#575E75] dark:text-[#9CA3AF]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Searchable text layer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Page metadata included</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportPdf}
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: accent.hex }}
          >
            <Download className="w-4 h-4" />
            <span>Download Searchable PDF</span>
          </button>
        </div>

        {/* Format 2: Word / DOCX */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex flex-col justify-between group hover:border-[#7C3AED] transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1C2337] dark:text-[#F3F1FA]">
              Microsoft Word (DOCX / DOC)
            </h3>
            <p className="text-xs text-[#858B9E] mt-1.5 leading-relaxed">
              Formatted document with Kannada typography, metadata summary box, and headers. Openable in MS Word, LibreOffice, and Google Docs.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-[#575E75] dark:text-[#9CA3AF]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Editable typography & styles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official letterhead ready</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportDocx}
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA] border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Word Document</span>
          </button>
        </div>

        {/* Format 3: Clean Plain UTF-8 Text (TXT) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex flex-col justify-between group hover:border-[#7C3AED] transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1C2337] dark:text-[#F3F1FA]">
              Clean UTF-8 Unicode Text (TXT)
            </h3>
            <p className="text-xs text-[#858B9E] mt-1.5 leading-relaxed">
              Pure extracted text preserving Kannada ottakshara, vowel signs, and punctuation. Ideal for databases, NLP pipelines, and indexing.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-[#575E75] dark:text-[#9CA3AF]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preserves exact Unicode characters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Header with confidence metadata</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportTxt}
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA] border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Download Plain Text (TXT)</span>
          </button>
        </div>
      </div>

      {/* Translations Export Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#7C3AED]" />
            <span>Export Multilingual Translations</span>
          </h3>
          <span className="text-xs text-[#858B9E]">
            {Object.keys(activeDocument.translations || {}).length} translations available
          </span>
        </div>

        {Object.keys(activeDocument.translations || {}).length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs text-[#858B9E] flex items-center justify-between">
            <span>No translations generated yet. Visit the Translation workspace to translate into 8 Indian languages.</span>
            <button
              onClick={() => setActiveView('translation')}
              className="font-bold text-[#7C3AED] hover:underline ml-2"
            >
              Go to Translation &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(activeDocument.translations).map(([langName, trans]) => (
              <div
                key={langName}
                className="p-3.5 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#F7F4EE]/50 dark:bg-[#22263A]/50 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-[#1C2337] dark:text-[#F3F1FA] block">
                    {langName}
                  </span>
                  <span className="text-[10px] text-[#858B9E]">
                    {new Date(trans.creationDate).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleExportTranslation(langName)}
                  className="p-2 rounded-xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2E354D] hover:text-[#7C3AED] shadow-2xs"
                  title={`Download ${langName} translation`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview Snippet of Export Payload */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
        <h4 className="text-xs font-semibold text-[#858B9E] uppercase tracking-wider">
          Export Document Text Preview:
        </h4>
        <div className="p-4 rounded-2xl bg-[#F7F4EE]/60 dark:bg-[#22263A]/60 border border-[#E3DDD2] dark:border-[#2E354D] max-h-48 overflow-y-auto text-xs font-kannada leading-relaxed text-[#575E75] dark:text-[#B1B7CC] whitespace-pre-wrap">
          {ocrText || 'No text extracted.'}
        </div>
      </div>
    </div>
  );
};
