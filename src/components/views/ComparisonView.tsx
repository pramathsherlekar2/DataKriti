import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentComparisonResult, DetectedChange } from '../../types';
import { compareDocuments, exportComparisonPdf, exportComparisonDocx, exportComparisonTxt } from '../../services/comparisonService';
import {
  GitCompare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Languages,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Search
} from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const { documents, activeDocument } = useApp();

  // Selected document IDs
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [targetLang, setTargetLang] = useState<'kannada' | 'english' | 'hindi'>('kannada');

  // Comparison State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<DocumentComparisonResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  // Default selection based on library documents
  useEffect(() => {
    if (documents.length >= 2) {
      const circOriginal = documents.find(d => d.id === 'doc-gov-circ-001');
      const circRevised = documents.find(d => d.id === 'doc-gov-circ-revised-004');

      if (circOriginal && circRevised) {
        setDocAId(circOriginal.id);
        setDocBId(circRevised.id);
      } else {
        setDocAId(documents[0].id);
        setDocBId(documents[1].id);
      }
    } else if (documents.length === 1) {
      setDocAId(documents[0].id);
    }
  }, [documents]);

  const docA = documents.find(d => d.id === docAId);
  const docB = documents.find(d => d.id === docBId);

  // Execute comparison
  const handleRunComparison = async () => {
    if (!docA || !docB) {
      setErrorMessage('Please select two documents to compare.');
      return;
    }
    if (docA.id === docB.id) {
      setErrorMessage('Please select two different documents to identify comparative differences.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const docAText = docA.pages[docA.currentPageIndex || 0]?.ocrResult?.extractedText || '';
    const docBText = docB.pages[docB.currentPageIndex || 0]?.ocrResult?.extractedText || '';

    try {
      const result = await compareDocuments(
        docAText,
        docBText,
        docA.filename,
        docB.filename
      );
      setComparisonResult(result);
      if (result.changes.length > 0) {
        setSelectedChangeId(result.changes[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Comparison failed. Please verify document contents.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click pair presets
  const handleLoadSamplePair = (idA: string, idB: string) => {
    setDocAId(idA);
    setDocBId(idB);
  };

  // Filtered changes
  const filteredChanges = (comparisonResult?.changes || []).filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const explK = c.explanationKannada.toLowerCase().includes(q);
      const explE = c.explanationEnglish.toLowerCase().includes(q);
      const matchOrig = c.originalText?.toLowerCase().includes(q) || false;
      const matchRev = c.revisedText?.toLowerCase().includes(q) || false;
      const matchSec = c.sectionName?.toLowerCase().includes(q) || false;
      return explK || explE || matchOrig || matchRev || matchSec;
    }
    return true;
  });

  const getExplanation = (c: DetectedChange) => {
    if (targetLang === 'kannada') return c.explanationKannada;
    if (targetLang === 'hindi' && c.explanationHindi) return c.explanationHindi;
    return c.explanationEnglish;
  };

  const getOverallSummary = () => {
    if (!comparisonResult) return '';
    if (targetLang === 'kannada') return comparisonResult.summary.overallAssessmentKannada;
    if (targetLang === 'hindi' && comparisonResult.summary.overallAssessmentHindi) {
      return comparisonResult.summary.overallAssessmentHindi;
    }
    return comparisonResult.summary.overallAssessmentEnglish;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <GitCompare className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Smart Document Comparison & Change Detection
              </h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-kannada">
              ಕನ್ನಡ ದಾಖಲೆಗಳ ಮಧ್ಯೆ ಮಹತ್ವದ ವ್ಯತ್ಯಾಸಗಳು, ತಿದ್ದುಪಡಿಗಳು ಮತ್ತು ನೀತಿ ನಿಯಮ ಬದಲಾವಣೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" /> Explanation Language:
            </span>
            <div className="inline-flex rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] p-0.5 text-xs">
              <button
                onClick={() => setTargetLang('kannada')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  targetLang === 'kannada'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setTargetLang('english')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  targetLang === 'english'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setTargetLang('hindi')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  targetLang === 'hindi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Selection Section */}
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Document A Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                <span>Base Document A (Original / Earlier Version)</span>
                {docA && <span className="text-[10px] text-blue-500 font-mono">{docA.fileSizeFormatted}</span>}
              </label>
              <select
                value={docAId}
                onChange={(e) => setDocAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Original Document --</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.documentCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* Document B Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                <span>Revised Document B (Amended / Comparison Version)</span>
                {docB && <span className="text-[10px] text-emerald-500 font-mono">{docB.fileSizeFormatted}</span>}
              </label>
              <select
                value={docBId}
                onChange={(e) => setDocBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Revised Document --</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.documentCategory})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Presets & Compare Action */}
        <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Pair:</span>
            <button
              type="button"
              onClick={() => handleLoadSamplePair('doc-gov-circ-001', 'doc-gov-circ-revised-004')}
              className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors"
            >
              Circular 48 (Original) vs Circular 48 (Revised 2026)
            </button>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isLoading || !docAId || !docBId || docAId === docBId}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-2 shadow-md transition-all ml-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Comparing Documents...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Run Intelligent Comparison</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Section */}
      {comparisonResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border-color)] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[var(--text-primary)]">Executive Comparison Summary</h3>
                  {!comparisonResult.summary.isSubstantiallyIdentical ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Substantive Policy Changes Detected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                      Substantially Identical Documents
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Comparison completed at {new Date(comparisonResult.comparisonDate).toLocaleTimeString()}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportComparisonPdf(comparisonResult, docA?.filename || 'DocA', docB?.filename || 'DocB')}
                  className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                  title="Export formal PDF analysis report"
                >
                  <Download className="w-3.5 h-3.5 text-rose-500" /> PDF
                </button>
                <button
                  onClick={() => exportComparisonDocx(comparisonResult, docA?.filename || 'DocA', docB?.filename || 'DocB')}
                  className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                  title="Export editable Word document"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" /> DOCX
                </button>
                <button
                  onClick={() => exportComparisonTxt(comparisonResult, docA?.filename || 'DocA', docB?.filename || 'DocB')}
                  className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                  title="Export raw text summary"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> TXT
                </button>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">Total Changes</span>
                <span className="text-2xl font-bold text-[var(--text-primary)]">{comparisonResult.summary.totalChanges}</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Added Clauses</span>
                <span className="text-2xl font-bold text-emerald-500">+{comparisonResult.summary.addedCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">Removed Clauses</span>
                <span className="text-2xl font-bold text-rose-500">-{comparisonResult.summary.removedCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Modified Clauses</span>
                <span className="text-2xl font-bold text-amber-500">~{comparisonResult.summary.modifiedCount}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--app-background)] text-xs leading-relaxed text-[var(--text-secondary)] border border-[var(--border-color)]">
              <p className="font-medium text-[var(--text-primary)] mb-1">Synthesis:</p>
              {getOverallSummary()}
            </div>
          </div>

          {/* Side-by-Side Visual Inspection & Text View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Document A Preview */}
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[280px]">
                    {docA?.filename}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                  Original
                </span>
              </div>
              <div className="flex-1 overflow-y-auto mt-3 p-3 bg-[var(--app-background)] rounded-lg text-xs leading-relaxed font-kannada whitespace-pre-wrap select-text border border-[var(--border-color)]/60">
                {docA?.pages[docA.currentPageIndex || 0]?.ocrResult?.extractedText || 'No text extracted'}
              </div>
            </div>

            {/* Document B Preview */}
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[280px]">
                    {docB?.filename}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Revised
                </span>
              </div>
              <div className="flex-1 overflow-y-auto mt-3 p-3 bg-[var(--app-background)] rounded-lg text-xs leading-relaxed font-kannada whitespace-pre-wrap select-text border border-[var(--border-color)]/60">
                {docB?.pages[docB.currentPageIndex || 0]?.ocrResult?.extractedText || 'No text extracted'}
              </div>
            </div>
          </div>

          {/* Change Filter Bar & Search */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Type:
                </span>
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--app-background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({comparisonResult.changes.length})
                </button>
                <button
                  onClick={() => setFilterType('added')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterType === 'added'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  + Added ({comparisonResult.summary.addedCount})
                </button>
                <button
                  onClick={() => setFilterType('removed')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterType === 'removed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  - Removed ({comparisonResult.summary.removedCount})
                </button>
                <button
                  onClick={() => setFilterType('modified')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterType === 'modified'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  ~ Modified ({comparisonResult.summary.modifiedCount})
                </button>
              </div>

              {/* Text Search inside changes */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter changes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Changes Detailed List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
              <span>Granular Change Breakdown ({filteredChanges.length} visible)</span>
              <span className="text-xs text-[var(--text-muted)] font-normal">Click any change to inspect details</span>
            </h4>

            {filteredChanges.length === 0 ? (
              <div className="p-8 text-center bg-[var(--card-background)] rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] text-xs">
                No changes matching the selected filter.
              </div>
            ) : (
              filteredChanges.map((change) => {
                const isSelected = selectedChangeId === change.id;
                const isAdded = change.type === 'added';
                const isRemoved = change.type === 'removed';
                const isModified = change.type === 'modified';

                return (
                  <div
                    key={change.id}
                    onClick={() => setSelectedChangeId(change.id)}
                    className={`rounded-xl border transition-all cursor-pointer p-4 ${
                      isSelected
                        ? 'border-blue-500 ring-1 ring-blue-500/50 bg-[var(--card-background)] shadow-md'
                        : 'border-[var(--border-color)] bg-[var(--card-background)]/80 hover:border-[var(--border-color)] hover:bg-[var(--card-background)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]/60">
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <PlusCircle className="w-3 h-3" /> ADDED
                          </span>
                        )}
                        {isRemoved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <MinusCircle className="w-3 h-3" /> REMOVED
                          </span>
                        )}
                        {isModified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <RefreshCw className="w-3 h-3" /> MODIFIED
                          </span>
                        )}

                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          Category: {change.category.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {change.sectionName && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--app-background)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                            {change.sectionName}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            change.significance === 'high'
                              ? 'bg-rose-500/20 text-rose-400'
                              : change.significance === 'medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {change.significance} impact
                        </span>
                      </div>
                    </div>

                    {/* Diff comparison preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
                      {change.originalText && (
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                            Before (Doc A):
                          </span>
                          <p className="font-kannada text-[var(--text-secondary)] line-through decoration-rose-500/60">
                            {change.originalText}
                          </p>
                        </div>
                      )}

                      {change.revisedText && (
                        <div className={`p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs ${!change.originalText ? 'md:col-span-2' : ''}`}>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                            After (Doc B):
                          </span>
                          <p className="font-kannada text-[var(--text-primary)] font-medium">
                            {change.revisedText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Linguistic Explanation */}
                    <div className="pt-2 text-xs text-[var(--text-secondary)] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--text-primary)]">Explanation: </strong>
                        <span>{getExplanation(change)}</span>
                        {change.impactReason && (
                          <span className="block mt-1 text-[var(--text-muted)] italic">
                            Policy Impact: {change.impactReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
