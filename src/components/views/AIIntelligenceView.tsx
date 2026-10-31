import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Calendar,
  AlertCircle,
  Building,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Download,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS, DOCUMENT_CATEGORIES } from '../../constants/accentColors';
import { extractDocumentInfo, generateDocumentSummary, simplifyKannadaText } from '../../services/api';
import { AISummary, DocumentCategory, ExtractedInformation, SimplificationResult } from '../../types';

export const AIIntelligenceView: React.FC = () => {
  const { activeDocument, updateDocument, setActiveView, preferences, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [activeTab, setActiveTab] = useState<'summary' | 'extraction' | 'simplification'>('summary');
  const [summaryLength, setSummaryLength] = useState<'short' | 'standard' | 'detailed'>('standard');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const docText = page?.ocrResult?.correctedText || page?.ocrResult?.extractedText || '';

  const summary = activeDocument?.summaries?.[summaryLength] || activeDocument?.summaries?.standard;
  const extraction = activeDocument?.extractedInfo;
  const simplification = activeDocument?.simplification;

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <Sparkles className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Upload a Kannada document to perform structured AI intelligence extraction.</p>
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

  // Generate Summary
  const handleGenerateSummary = async (len: 'short' | 'standard' | 'detailed' = summaryLength) => {
    setIsLoading(true);
    try {
      showToast(`Generating ${len} summary for ${activeDocument.documentCategory}...`, 'info');
      const res = await generateDocumentSummary(docText, len, activeDocument.documentCategory);

      const newSummary: AISummary = {
        id: 'sum-' + Date.now().toString(36),
        documentId: activeDocument.id,
        summaryType: len,
        mainSubject: res.mainSubject,
        mainSubjectKannada: res.mainSubjectKannada,
        shortSummary: res.shortSummary,
        detailedSummary: res.detailedSummary,
        importantPoints: res.importantPoints || [],
        keyInstructions: res.keyInstructions || [],
        importantDates: res.importantDates || [],
        mainConclusions: res.mainConclusions || '',
        simpleLanguageExplanation: res.simpleLanguageExplanation || '',
        creationDate: new Date().toISOString(),
      };

      const updatedDoc = {
        ...activeDocument,
        summaries: {
          ...activeDocument.summaries,
          [len]: newSummary,
        },
      };

      await updateDocument(updatedDoc);
      showToast('Document summary generated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Summary generation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Information Extraction
  const handleExtractInfo = async () => {
    setIsLoading(true);
    try {
      showToast('Extracting structured entities from Kannada text...', 'info');
      const res = await extractDocumentInfo(docText, activeDocument.documentCategory);
      const updatedDoc = {
        ...activeDocument,
        extractedInfo: {
          ...res,
          documentId: activeDocument.id,
          creationDate: new Date().toISOString(),
        },
      };

      await updateDocument(updatedDoc);
      showToast('Information extraction complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Information extraction failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Simplification Mode
  const handleSimplify = async () => {
    setIsLoading(true);
    try {
      showToast('Simplifying complex Kannada into plain language...', 'info');
      const res = await simplifyKannadaText(docText);
      const updatedDoc = {
        ...activeDocument,
        simplification: {
          ...res,
          documentId: activeDocument.id,
          creationDate: new Date().toISOString(),
        },
      };

      await updateDocument(updatedDoc);
      showToast('Language simplification complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Language simplification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Subnav: Summary / Information Extraction / Simplification */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-[#1A1E2F] text-[#7C3AED] dark:text-[#B7AAFF] shadow-xs'
                : 'text-[#575E75] dark:text-[#9CA3AF]'
            }`}
          >
            AI Document Summary (ಸಾರಾಂಶ)
          </button>

          <button
            onClick={() => {
              setActiveTab('extraction');
              if (!extraction) handleExtractInfo();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'extraction'
                ? 'bg-white dark:bg-[#1A1E2F] text-[#7C3AED] dark:text-[#B7AAFF] shadow-xs'
                : 'text-[#575E75] dark:text-[#9CA3AF]'
            }`}
          >
            Smart Information Extraction (ಮಾಹಿತಿ)
          </button>

          <button
            onClick={() => {
              setActiveTab('simplification');
              if (!simplification) handleSimplify();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'simplification'
                ? 'bg-white dark:bg-[#1A1E2F] text-[#7C3AED] dark:text-[#B7AAFF] shadow-xs'
                : 'text-[#575E75] dark:text-[#9CA3AF]'
            }`}
          >
            Simple Language Mode (ಸರಳೀಕರಣ)
          </button>
        </div>

        {/* Category Badge & Context */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#858B9E]">Target Category:</span>
          <span className="px-2.5 py-1 rounded-xl bg-[#F1ECE2] dark:bg-[#282D44] font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
            {activeDocument.documentCategory}
          </span>
        </div>
      </div>

      {/* TAB 1: AI DOCUMENT SUMMARY (Feature 6 & Feature 17) */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Summary Length Selector */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#858B9E]">Select Length:</span>
              {(['short', 'standard', 'detailed'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => {
                    setSummaryLength(len);
                    if (!activeDocument.summaries[len]) {
                      handleGenerateSummary(len);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl capitalize transition-colors ${
                    summaryLength === len
                      ? 'bg-[#7C3AED] text-white font-bold'
                      : 'bg-[#F7F4EE] dark:bg-[#22263A] text-[#575E75] dark:text-[#9CA3AF] hover:bg-[#E3DDD2]'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerateSummary(summaryLength)}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: accent.hex }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating...' : 'Regenerate Summary'}</span>
            </button>
          </div>

          {summary ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Main Subject & Citizen Plain Language (12 cols) */}
              <div className="md:col-span-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/10 via-purple-900/5 to-amber-900/10 border border-[#7C3AED]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Main Subject & Core Purpose (ಮುಖ್ಯ ವಿಷಯ)</span>
                </div>
                <h3 className="text-lg font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                  {summary.mainSubject}
                </h3>
                {summary.mainSubjectKannada && (
                  <p className="text-sm font-kannada text-[#575E75] dark:text-[#B1B7CC]">
                    {summary.mainSubjectKannada}
                  </p>
                )}

                <div className="pt-2 border-t border-[#7C3AED]/20">
                  <span className="text-xs font-bold text-[#D6A76C] uppercase tracking-wider block mb-1">
                    Plain-Language Citizen Explanation (ಜನಸಾಮಾನ್ಯರಿಗೆ ಸರಳ ವಿವರಣೆ):
                  </span>
                  <p className="text-xs text-[#1C2337] dark:text-[#F3F1FA] leading-relaxed">
                    {summary.simpleLanguageExplanation}
                  </p>
                </div>
              </div>

              {/* Detailed / Short Summary Text (7 cols) */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7C3AED]" />
                  <span>Document Narrative Summary ({summaryLength})</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#1C2337] dark:text-[#F3F1FA] leading-relaxed whitespace-pre-wrap">
                  {summaryLength === 'short' ? summary.shortSummary : summary.detailedSummary}
                </p>

                {summary.mainConclusions && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <strong className="text-emerald-900 dark:text-emerald-200 block mb-1">
                      Main Conclusions & Decisions:
                    </strong>
                    <span className="text-emerald-800 dark:text-emerald-300">
                      {summary.mainConclusions}
                    </span>
                  </div>
                )}
              </div>

              {/* Key Bullet Points & Important Dates (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                {/* Important Points */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Important Points (ಮುಖ್ಯ ಅಂಶಗಳು)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#575E75] dark:text-[#B1B7CC]">
                    {summary.importantPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Dates */}
                {summary.importantDates && summary.importantDates.length > 0 && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D6A76C]" />
                      <span>Extracted Chronology & Dates</span>
                    </h4>
                    <div className="space-y-2">
                      {summary.importantDates.map((dt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs flex items-center justify-between"
                        >
                          <span className="font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                            {dt.date}
                          </span>
                          <span className="text-[11px] text-[#858B9E]">{dt.significance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
              <Sparkles className="w-10 h-10 mx-auto text-[#7C3AED] mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
                No summary generated yet
              </p>
              <button
                onClick={() => handleGenerateSummary('standard')}
                disabled={isLoading}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: accent.hex }}
              >
                Generate Summary with Gemini
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMART INFORMATION EXTRACTION (Feature 10 & Feature 16) */}
      {activeTab === 'extraction' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C]">
            <div>
              <h3 className="text-sm font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                Extracted Entities & Operational Data
              </h3>
              <p className="text-xs text-[#858B9E]">
                Extracted strictly from verified Kannada document text with source provenance.
              </p>
            </div>
            <button
              onClick={handleExtractInfo}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: accent.hex }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Extracting...' : 'Re-extract Entities'}</span>
            </button>
          </div>

          {extraction ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Organizations */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Building className="w-4 h-4" />
                  <span>Organizations & Departments ({extraction.organizationNames?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extraction.organizationNames?.map((org, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs">
                      <strong className="block text-[#1C2337] dark:text-[#F3F1FA] font-kannada">
                        {org.name}
                      </strong>
                      {org.sourceSnippet && (
                        <span className="text-[10px] text-[#858B9E] font-kannada truncate block mt-0.5">
                          Source: &quot;{org.sourceSnippet}&quot;
                        </span>
                      )}
                    </div>
                  ))}
                  {(!extraction.organizationNames || extraction.organizationNames.length === 0) && (
                    <span className="text-xs text-[#858B9E] italic">None identified in document</span>
                  )}
                </div>
              </div>

              {/* Deadlines & Dates */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Clock className="w-4 h-4" />
                  <span>Deadlines & Time Limits ({extraction.deadlines?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extraction.deadlines?.map((dl, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs">
                      <strong className="block text-rose-900 dark:text-rose-200">
                        {dl.deadline}
                      </strong>
                      <span className="text-[11px] text-rose-800/80 dark:text-rose-300/80 block mt-0.5">
                        {dl.description}
                      </span>
                    </div>
                  ))}
                  {(!extraction.deadlines || extraction.deadlines.length === 0) && (
                    <span className="text-xs text-[#858B9E] italic">No strict deadlines mentioned</span>
                  )}
                </div>
              </div>

              {/* Monetary Amounts */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Fees & Monetary Amounts ({extraction.monetaryAmounts?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extraction.monetaryAmounts?.map((amt, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs">
                      <strong className="block text-emerald-700 dark:text-emerald-400 font-bold">
                        {amt.amount}
                      </strong>
                      <span className="text-[11px] text-[#575E75] dark:text-[#9CA3AF] block mt-0.5">
                        {amt.purpose}
                      </span>
                    </div>
                  ))}
                  {(!extraction.monetaryAmounts || extraction.monetaryAmounts.length === 0) && (
                    <span className="text-xs text-[#858B9E] italic">No monetary figures found</span>
                  )}
                </div>
              </div>

              {/* Document References & Numbers */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Bookmark className="w-4 h-4" />
                  <span>Document References & Numbers ({extraction.documentReferences?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {extraction.documentReferences?.map((ref, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs font-mono">
                      <strong className="block text-[#1C2337] dark:text-[#F3F1FA]">
                        {ref.reference}
                      </strong>
                    </div>
                  ))}
                  {(!extraction.documentReferences || extraction.documentReferences.length === 0) && (
                    <span className="text-xs text-[#858B9E] italic">No reference numbers</span>
                  )}
                </div>
              </div>

              {/* Contact Info (Phone / Email / Address) */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Phone className="w-4 h-4" />
                  <span>Helplines, Emails & Addresses</span>
                </div>
                <div className="space-y-2 text-xs">
                  {extraction.phoneNumbers?.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#1C2337] dark:text-[#F3F1FA]">
                      <Phone className="w-3.5 h-3.5 text-[#858B9E]" />
                      <span>{p.number}</span>
                    </div>
                  ))}
                  {extraction.emailAddresses?.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#1C2337] dark:text-[#F3F1FA]">
                      <Mail className="w-3.5 h-3.5 text-[#858B9E]" />
                      <span>{e.email}</span>
                    </div>
                  ))}
                  {extraction.addresses?.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#1C2337] dark:text-[#F3F1FA]">
                      <MapPin className="w-3.5 h-3.5 text-[#858B9E] shrink-0" />
                      <span className="font-kannada">{a.address}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Directives & Instructions */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Directives & Instructions</span>
                </div>
                <div className="space-y-2">
                  {extraction.importantInstructions?.map((ins, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs">
                      <span className="text-[#1C2337] dark:text-[#F3F1FA] font-medium leading-relaxed block">
                        {ins.instruction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
              <Building className="w-10 h-10 mx-auto text-[#7C3AED] mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
                Information extraction not triggered yet
              </p>
              <button
                onClick={handleExtractInfo}
                disabled={isLoading}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: accent.hex }}
              >
                Extract Entities with Gemini
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KANNADA TO SIMPLE LANGUAGE MODE (Feature 15) */}
      {activeTab === 'simplification' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C]">
            <div>
              <h3 className="text-sm font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Kannada-to-Simple-Language Mode (ಸರಳ ಭಾಷಾ ರೂಪಾಂತರ)</span>
              </h3>
              <p className="text-xs text-[#858B9E]">
                Transforms formal administrative, legal, or archaic Kannada into crystal-clear plain Kannada, English, and Hindi explanations without altering legal meaning.
              </p>
            </div>
            <button
              onClick={handleSimplify}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: accent.hex }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Simplifying...' : 'Re-simplify Text'}</span>
            </button>
          </div>

          {simplification ? (
            <div className="space-y-5">
              {/* Actions & Timing Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[#858B9E]">
                  Tri-lingual plain-language conversion preserving legal validity:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const content = `DATAKRITI KANNADA SIMPLIFICATION DOSSIER\nDocument: ${activeDocument.filename}\n\n1. SIMPLE KANNADA (ಸರಳ ಕನ್ನಡ):\n${simplification.simplifiedKannada}\n\n2. PLAIN ENGLISH BREAKDOWN:\n${simplification.easyEnglish}\n\n3. HINDI EXPLANATION:\n${simplification.hindiExplanation}\n\n4. GLOSSARY:\n${simplification.difficultWordsGlossary?.map((g) => `${g.word} -> ${g.simpleMeaningKannada} (${g.englishMeaning})`).join('\n') || 'None'}`;
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeDocument.filename}-simplified.txt`;
                      a.click();
                      showToast('Downloaded simplification dossier', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 font-semibold text-[#1C2337] dark:text-[#F3F1FA]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Dossier</span>
                  </button>
                </div>
              </div>

              {/* Tri-Language Side-by-Side Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Simple Kannada */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#E3DDD2] dark:border-[#2D334C]">
                    <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider block">
                      Simple Kannada (ಸರಳ ಕನ್ನಡ):
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(simplification.simplifiedKannada);
                        showToast('Copied Simple Kannada', 'info');
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#858B9E]"
                      title="Copy Simple Kannada"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-kannada leading-relaxed text-[#1C2337] dark:text-[#F3F1FA] whitespace-pre-wrap">
                    {simplification.simplifiedKannada}
                  </p>
                </div>

                {/* Plain English */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#E3DDD2] dark:border-[#2D334C]">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Plain English Breakdown:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(simplification.easyEnglish);
                        showToast('Copied Plain English', 'info');
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#858B9E]"
                      title="Copy Plain English"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#1C2337] dark:text-[#F3F1FA] whitespace-pre-wrap">
                    {simplification.easyEnglish}
                  </p>
                </div>

                {/* Simple Hindi */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#E3DDD2] dark:border-[#2D334C]">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      सरल हिंदी व्याख्या:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(simplification.hindiExplanation);
                        showToast('Copied Simple Hindi', 'info');
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#858B9E]"
                      title="Copy Simple Hindi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#1C2337] dark:text-[#F3F1FA] whitespace-pre-wrap">
                    {simplification.hindiExplanation}
                  </p>
                </div>
              </div>

              {/* Side-by-side original phrase comparison if present */}
              {simplification.paragraphComparison && simplification.paragraphComparison.length > 0 && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                    Sentence-by-Sentence Simplification Mapping:
                  </h4>
                  <div className="space-y-2">
                    {simplification.paragraphComparison.map((comp, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] text-xs font-kannada"
                      >
                        <div className="text-rose-800 dark:text-rose-300">
                          <span className="text-[10px] font-sans font-bold block opacity-70 mb-0.5">ಮೂಲ ಸಂಕೀರ್ಣ ವಾಕ್ಯ:</span>
                          {comp.originalSnippet}
                        </div>
                        <div className="text-emerald-800 dark:text-emerald-300">
                          <span className="text-[10px] font-sans font-bold block opacity-70 mb-0.5">ಸರಳ ರೂಪಾಂತರ:</span>
                          {comp.simplifiedSnippet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficult Words Glossary Table */}
              {simplification.difficultWordsGlossary && simplification.difficultWordsGlossary.length > 0 && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                    Difficult Kannada Terminology Explained (ಕಠಿಣ ಪದಗಳ ಕೋಶ):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {simplification.difficultWordsGlossary.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D] text-xs"
                      >
                        <strong className="text-sm font-kannada font-bold text-[#7C3AED] dark:text-[#B7AAFF] block">
                          {item.word}
                        </strong>
                        <span className="text-[11px] font-kannada text-[#1C2337] dark:text-[#F3F1FA] block mt-0.5">
                          ಸರಳ ಅರ್ಥ: {item.simpleMeaningKannada}
                        </span>
                        <span className="text-[10px] text-[#858B9E] block mt-0.5">
                          English: {item.englishMeaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
              <BookOpen className="w-10 h-10 mx-auto text-[#7C3AED] mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#1C2337] dark:text-[#F3F1FA]">
                Simplification analysis ready
              </p>
              <button
                onClick={handleSimplify}
                disabled={isLoading}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: accent.hex }}
              >
                Transform into Plain Kannada & English
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
