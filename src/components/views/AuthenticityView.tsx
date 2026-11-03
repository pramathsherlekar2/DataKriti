import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthenticityReport, SuspiciousRegion } from '../../types';
import {
  analyzeAuthenticity,
  computeErrorLevelAnalysis,
  exportAuthenticityPdf,
  exportAuthenticityJson,
  exportAuthenticityTxt,
} from '../../services/authenticityService';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle,
  Download,
  FileSearch,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const AuthenticityView: React.FC = () => {
  const { documents, activeDocument } = useApp();

  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visual' | 'metadata' | 'ocr' | 'structure'>('visual');
  const [viewMode, setViewMode] = useState<'normal' | 'overlay' | 'ela'>('overlay');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AuthenticityReport | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [elaImageUrl, setElaImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Set default document
  useEffect(() => {
    if (activeDocument && documents.some((d) => d.id === activeDocument.id)) {
      setSelectedDocId(activeDocument.id);
    } else if (documents.length > 0) {
      // Default to suspect sample if present, otherwise first doc
      const suspectDoc = documents.find((d) => d.id === 'doc-tampered-sample-005');
      setSelectedDocId(suspectDoc ? suspectDoc.id : documents[0].id);
    }
  }, [activeDocument, documents]);

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  // Run forensic analysis
  const handleAnalyze = async () => {
    if (!currentDoc) return;
    setIsLoading(true);
    setErrorMessage(null);
    setElaImageUrl(null);

    const docText = currentDoc.pages[currentDoc.currentPageIndex || 0]?.ocrResult?.extractedText || '';

    try {
      const rep = await analyzeAuthenticity(
        currentDoc.id,
        currentDoc.filename,
        docText,
        {
          fileSize: currentDoc.fileSizeFormatted,
          uploadDate: currentDoc.uploadDate,
          pageCount: currentDoc.pageCount,
        }
      );
      setReport(rep);
      if (rep.suspiciousRegions.length > 0) {
        setSelectedRegionId(rep.suspiciousRegions[0].id);
      }

      // If image exists, compute ELA map in background
      if (imageRef.current) {
        try {
          const ela = await computeErrorLevelAnalysis(imageRef.current);
          setElaImageUrl(ela);
        } catch (e) {
          console.warn('ELA computation error:', e);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Forensic analysis encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-compute ELA if image changes and report exists
  const handleImageLoad = async () => {
    if (imageRef.current && report && !elaImageUrl) {
      try {
        const ela = await computeErrorLevelAnalysis(imageRef.current);
        setElaImageUrl(ela);
      } catch (e) {
        console.warn('ELA computation fallback error:', e);
      }
    }
  };

  // Format verdict badge
  const renderVerdictBadge = (classification: AuthenticityReport['classification']) => {
    switch (classification) {
      case 'no_suspicious_indicators':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">No Suspicious Indicators Detected</div>
              <div className="text-[10px] opacity-80">Document demonstrates visual & typographic consistency</div>
            </div>
          </div>
        );
      case 'potential_inconsistencies':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Potential Inconsistencies</div>
              <div className="text-[10px] opacity-80">Minor anomalies observed; manual audit recommended</div>
            </div>
          </div>
        );
      case 'significant_suspicious_indicators':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Significant Suspicious Indicators</div>
              <div className="text-[10px] opacity-80">Definite typographic mismatch or digital splicing detected</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <ShieldQuestion className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Insufficient Evidence</div>
              <div className="text-[10px] opacity-80">Image resolution or metadata insufficient for definitive verification</div>
            </div>
          </div>
        );
    }
  };

  const selectedRegion = report?.suspiciousRegions.find((r) => r.id === selectedRegionId);
  const activeImage = currentDoc?.pages[currentDoc.currentPageIndex || 0]?.originalImage;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <FileSearch className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Smart Document Authenticity & Tampering Detection
              </h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-kannada">
              ಕನ್ನಡ ದಾಖಲೆಗಳ ಸತ್ಯಾಸತ್ಯತೆ, ಡಿಜಿಟಲ್ ತಿರುಚುವಿಕೆ (Tampering) ಮತ್ತು ಅಕ್ರಮ ನಕಲಿ ತಿದ್ದುಪಡಿಗಳ ವಿಧಿವಿಜ್ಞಾನ ತಪಾಸಣೆ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-amber-500/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
              <Info className="w-4 h-4 shrink-0" />
              <span>Assisted Forensic Verification Protocol</span>
            </span>
          </div>
        </div>
      </div>

      {/* Document Selector & Action Panel */}
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              <span>Select Document for Forensic Audit</span>
              {currentDoc && (
                <span className="text-[10px] text-indigo-400 font-mono">
                  {currentDoc.documentCategory} • {currentDoc.fileSizeFormatted}
                </span>
              )}
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setReport(null);
                setElaImageUrl(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.documentCategory})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3 flex items-end justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !currentDoc}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Forensic Evidence...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute Forensic Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Samples:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedDocId('doc-tampered-sample-005');
              setReport(null);
            }}
            className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition-colors"
          >
            Suspect Land Grant Sanad (Tampered Date & Spliced Seal)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDocId('doc-gov-circ-001');
              setReport(null);
            }}
            className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
          >
            Official Circular 48 (Authentic Baseline Reference)
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Main Forensic Workspace */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Verdict and Export Dossier Header */}
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border-color)] gap-4">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">
                  Overall Authenticity Determination
                </div>
                {renderVerdictBadge(report.classification)}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mr-2 hidden sm:block">
                  <div className="text-xs font-medium text-[var(--text-secondary)]">Confidence Score</div>
                  <div className="text-base font-bold text-indigo-400">
                    {report.confidenceScore}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAuthenticityPdf(report, currentDoc?.filename || 'Document')}
                    className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                    title="Export formal PDF verification dossier"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-500" /> Dossier PDF
                  </button>
                  <button
                    onClick={() => exportAuthenticityJson(report, currentDoc?.filename || 'Document')}
                    className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                    title="Export raw JSON forensic evidence"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" /> JSON
                  </button>
                  <button
                    onClick={() => exportAuthenticityTxt(report, currentDoc?.filename || 'Document')}
                    className="px-3 py-1.5 rounded-md bg-[var(--app-background)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                    title="Export text report"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" /> TXT
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Findings */}
            <div className="p-3.5 rounded-lg bg-[var(--app-background)] text-xs leading-relaxed text-[var(--text-secondary)] border border-[var(--border-color)] space-y-1">
              <div>
                <strong className="text-[var(--text-primary)]">English Assessment: </strong>
                {report.summaryStatementEnglish}
              </div>
              <div>
                <strong className="text-[var(--text-primary)] font-kannada">ಕನ್ನಡ ಮೌಲ್ಯಮಾಪನ: </strong>
                <span className="font-kannada">{report.summaryStatementKannada}</span>
              </div>
            </div>
          </div>

          {/* Interactive Document Inspection Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Visual Canvas & Bounding Box Overlays */}
            <div className="lg:col-span-7 bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Forensic Visual Inspection
                  </span>
                </div>

                {/* View Mode Toggle: Normal vs Overlay vs ELA */}
                <div className="inline-flex rounded-lg border border-[var(--border-color)] bg-[var(--app-background)] p-0.5 text-xs">
                  <button
                    onClick={() => setViewMode('overlay')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      viewMode === 'overlay'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Flagged Overlay ({report.suspiciousRegions.length})
                  </button>
                  <button
                    onClick={() => setViewMode('normal')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      viewMode === 'normal'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Clean View
                  </button>
                  <button
                    onClick={() => setViewMode('ela')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      viewMode === 'ela'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Error Level Analysis (compression boundary anomalies)"
                  >
                    ELA Heatmap
                  </button>
                </div>
              </div>

              {/* Document Image with Bounding Boxes */}
              <div className="relative flex-1 min-h-[480px] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-2 select-none">
                {activeImage ? (
                  <div className="relative inline-block max-w-full max-h-[600px]">
                    <img
                      ref={imageRef}
                      src={viewMode === 'ela' && elaImageUrl ? elaImageUrl : activeImage}
                      alt="Document for forensic examination"
                      onLoad={handleImageLoad}
                      className="max-h-[580px] w-auto object-contain rounded shadow-lg"
                    />

                    {/* Interactive Bounding Boxes Overlay */}
                    {viewMode === 'overlay' &&
                      report.suspiciousRegions.map((region) => {
                        const [ymin, xmin, ymax, xmax] = region.boundingBox;
                        const top = `${ymin / 10}%`;
                        const left = `${xmin / 10}%`;
                        const height = `${(ymax - ymin) / 10}%`;
                        const width = `${(xmax - xmin) / 10}%`;
                        const isSelected = selectedRegionId === region.id;
                        const isHigh = region.severity === 'high';

                        return (
                          <div
                            key={region.id}
                            onClick={() => setSelectedRegionId(region.id)}
                            style={{ top, left, width, height }}
                            className={`absolute border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'ring-4 ring-rose-500 ring-opacity-70 bg-rose-500/30'
                                : isHigh
                                ? 'border-rose-500 bg-rose-500/15 hover:bg-rose-500/25'
                                : 'border-amber-400 bg-amber-400/15 hover:bg-amber-400/25'
                            }`}
                          >
                            <span
                              className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
                                isHigh ? 'bg-rose-600' : 'bg-amber-600'
                              }`}
                            >
                              {region.id} ({region.severity})
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No image available for this document.
                  </div>
                )}
              </div>

              {/* View Mode Description Banner */}
              <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between px-1">
                {viewMode === 'ela' ? (
                  <span>
                    <strong>Error Level Analysis (ELA):</strong> Bright, high-contrast borders represent distinct compression quality signatures (evidence of pasted or spliced content).
                  </span>
                ) : (
                  <span>
                    Click any highlighted region above or card on the right to inspect forensic evidence.
                  </span>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Finding Details & Evidence Tabs */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Selected Region Detailed Card */}
              {selectedRegion ? (
                <div className="bg-[var(--card-background)] border-2 border-rose-500/40 rounded-xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {selectedRegion.id} • {selectedRegion.severity.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Coords: [{selectedRegion.boundingBox.join(', ')}]
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    {selectedRegion.title}
                  </h4>

                  <div className="text-xs space-y-2 text-[var(--text-secondary)]">
                    <div>
                      <strong className="text-[var(--text-primary)]">Forensic Evidence:</strong>
                      <p className="mt-0.5 p-2 bg-[var(--app-background)] rounded border border-[var(--border-color)]">
                        {selectedRegion.evidence}
                      </p>
                    </div>

                    <div>
                      <strong className="text-[var(--text-primary)]">Kannada Explanation:</strong>
                      <p className="mt-0.5 font-kannada text-[var(--text-secondary)]">
                        {selectedRegion.explanationKannada}
                      </p>
                    </div>

                    <div>
                      <strong className="text-[var(--text-primary)]">Recommended Human Audit Action:</strong>
                      <p className="mt-0.5 text-indigo-400">
                        → {selectedRegion.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 text-xs text-[var(--text-muted)] text-center">
                  Select a flagged region on the document to view detailed evidence.
                </div>
              )}

              {/* 4 Analysis Tabs */}
              <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col">
                {/* Tab Navigation */}
                <div className="flex border-b border-[var(--border-color)] overflow-x-auto text-xs pb-1 gap-1">
                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'visual'
                        ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Visual & Type ({report.visualConsistencyFindings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('metadata')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'metadata'
                        ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Metadata ({report.metadataFindings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ocr')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'ocr'
                        ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    OCR Discrepancies ({report.ocrDiscrepancies.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'structure'
                        ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Recommendations
                  </button>
                </div>

                {/* Tab 1: Visual Consistency */}
                {activeTab === 'visual' && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {report.visualConsistencyFindings.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[var(--app-background)] border border-[var(--border-color)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)]">{item.aspect}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'flagged'
                                ? 'bg-rose-500/20 text-rose-400'
                                : item.status === 'minor_anomaly'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)]">{item.observation}</p>
                        <p className="text-[11px] text-indigo-400">
                          <strong>Explanation:</strong> {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Metadata Examination */}
                {activeTab === 'metadata' && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {report.metadataFindings.map((meta, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[var(--app-background)] border border-[var(--border-color)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)]">{meta.property}</span>
                          {meta.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                              <CheckCircle className="w-3 h-3" /> NORMAL
                            </span>
                          ) : meta.status === 'suspicious' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded font-bold">
                              <XCircle className="w-3 h-3" /> SUSPICIOUS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded font-bold">
                              {meta.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          Value: <span className="text-[var(--text-primary)] font-medium">{meta.value}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">{meta.details}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: OCR Discrepancies */}
                {activeTab === 'ocr' && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {report.ocrDiscrepancies.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                        No OCR character or font discrepancies recorded.
                      </div>
                    ) : (
                      report.ocrDiscrepancies.map((ocr, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[var(--app-background)] border border-[var(--border-color)] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-primary)] font-kannada">
                              {ocr.regionSnippet}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-400">
                              {ocr.discrepancyType}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                            <div>Visual: <span className="text-[var(--text-primary)]">{ocr.visualAppearance}</span></div>
                            <div>OCR: <span className="text-[var(--text-primary)]">{ocr.ocrDetected}</span></div>
                          </div>
                          <p className="text-[11px] text-amber-400">
                            <strong>Severity:</strong> {ocr.severity}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 4: Recommendations */}
                {activeTab === 'structure' && (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Actionable Verification Steps:
                    </p>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-[var(--app-background)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
