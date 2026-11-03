import { AuthenticityReport } from '../types';
import { analyzeAuthenticityApi } from './api';
import { performForensicAuthenticityAnalysis } from './comparisonAndAuthenticityEngine';
import jsPDF from 'jspdf';

/**
 * Service to orchestrate forensic authenticity analysis, ELA image computation, and report exports.
 */
export async function analyzeAuthenticity(
  documentId: string,
  documentTitle: string,
  extractedText: string,
  fileMetadata: any = {}
): Promise<AuthenticityReport> {
  try {
    const apiResult = await analyzeAuthenticityApi(
      documentId,
      documentTitle,
      extractedText,
      fileMetadata
    );
    if (apiResult && apiResult.classification) {
      return apiResult;
    }
    throw new Error('API returned empty or invalid authenticity report');
  } catch (error) {
    console.warn('Backend authenticity endpoint unavailable or failed, utilizing local forensic engine:', error);
    return performForensicAuthenticityAnalysis(
      documentId,
      documentTitle,
      extractedText,
      fileMetadata
    );
  }
}

/**
 * Computes Error Level Analysis (ELA) map directly on the client canvas.
 * ELA saves the image at a known quality level (e.g. 75%) and calculates the difference
 * between the original and recompressed image. High contrast areas signify potential tampering/splicing.
 */
export async function computeErrorLevelAnalysis(
  imgElement: HTMLImageElement,
  scale = 15
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const w = imgElement.naturalWidth || imgElement.width || 800;
      const h = imgElement.naturalHeight || imgElement.height || 1000;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(imgElement, 0, 0, w, h);
      const originalData = ctx.getImageData(0, 0, w, h);

      // Re-compress to JPEG at 75% quality
      const recompressedUrl = canvas.toDataURL('image/jpeg', 0.75);
      const recompressedImg = new Image();
      recompressedImg.crossOrigin = 'anonymous';
      recompressedImg.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(recompressedImg, 0, 0, w, h);
        const recompressedData = ctx.getImageData(0, 0, w, h);

        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = w;
        diffCanvas.height = h;
        const diffCtx = diffCanvas.getContext('2d');
        if (!diffCtx) {
          resolve(recompressedUrl);
          return;
        }

        const diffData = diffCtx.createImageData(w, h);
        for (let i = 0; i < originalData.data.length; i += 4) {
          const rDiff = Math.abs(originalData.data[i] - recompressedData.data[i]) * scale;
          const gDiff = Math.abs(originalData.data[i + 1] - recompressedData.data[i + 1]) * scale;
          const bDiff = Math.abs(originalData.data[i + 2] - recompressedData.data[i + 2]) * scale;

          diffData.data[i] = Math.min(255, rDiff);
          diffData.data[i + 1] = Math.min(255, gDiff);
          diffData.data[i + 2] = Math.min(255, bDiff);
          diffData.data[i + 3] = 255; // opaque
        }

        diffCtx.putImageData(diffData, 0, 0);
        resolve(diffCanvas.toDataURL('image/png'));
      };
      recompressedImg.onerror = () => {
        resolve(canvas.toDataURL('image/png'));
      };
      recompressedImg.src = recompressedUrl;
    } catch (err) {
      console.error('ELA computation error:', err);
      reject(err);
    }
  });
}

/**
 * Exports authenticity forensic report to TXT format.
 */
export function exportAuthenticityTxt(
  report: AuthenticityReport,
  docTitle: string
): void {
  const lines: string[] = [
    '====================================================================',
    '    DATAKRITI — FORENSIC AUTHENTICITY & INTEGRITY AUDIT REPORT     ',
    '        ಕನ್ನಡ ದಾಖಲೆ ದೃಢೀಕರಣ ಮತ್ತು ನಕಲಿ ಪರಿಶೀಲನಾ ತನಿಖಾ ವರದಿ          ',
    '====================================================================',
    '',
    `Analyzed Document: ${docTitle} (ID: ${report.documentId})`,
    `Audit Timestamp:   ${new Date(report.analysisDate).toLocaleString()}`,
    `Overall Verdict:   ${report.classification.toUpperCase()}`,
    `Confidence Score:  ${report.confidenceScore}%`,
    '',
    '--------------------------------------------------------------------',
    '                       EXECUTIVE SUMMARY                            ',
    '--------------------------------------------------------------------',
    `English: ${report.summaryStatementEnglish}`,
    `Kannada: ${report.summaryStatementKannada}`,
    '',
    '--------------------------------------------------------------------',
    '                       FLAGGED REGIONS                              ',
    '--------------------------------------------------------------------',
  ];

  report.suspiciousRegions.forEach((reg, idx) => {
    lines.push(`\n[FLAGGED REGION #${idx + 1}] ID: ${reg.id} | Severity: ${reg.severity.toUpperCase()}`);
    lines.push(`Location Bounding Box: [ymin:${reg.boundingBox[0]}, xmin:${reg.boundingBox[1]}, ymax:${reg.boundingBox[2]}, xmax:${reg.boundingBox[3]}]`);
    lines.push(`Title:       ${reg.title}`);
    lines.push(`Issue Type:  ${reg.issueType}`);
    lines.push(`Evidence:    ${reg.evidence}`);
    lines.push(`Kannada:     ${reg.explanationKannada}`);
    lines.push(`English:     ${reg.explanationEnglish}`);
    lines.push(`Recommended Action: ${reg.recommendation}`);
    lines.push('--------------------------------------------------------------------');
  });

  lines.push('\n--------------------------------------------------------------------');
  lines.push('                       METADATA FINDINGS                            ');
  lines.push('--------------------------------------------------------------------');
  report.metadataFindings.forEach((m) => {
    lines.push(`- [${m.status.toUpperCase()}] ${m.property}: "${m.value}"`);
    lines.push(`  Details: ${m.details}`);
  });

  lines.push('\n--------------------------------------------------------------------');
  lines.push('                     VISUAL & OCR ANOMALIES                         ');
  lines.push('--------------------------------------------------------------------');
  report.visualConsistencyFindings.forEach((v) => {
    lines.push(`- [${v.status.toUpperCase()}] ${v.aspect}: ${v.observation}`);
    lines.push(`  Explanation: ${v.explanation}`);
  });

  report.ocrDiscrepancies.forEach((o) => {
    lines.push(`- [OCR] Location: ${o.regionSnippet}`);
    lines.push(`  Visual: "${o.visualAppearance}" vs Detected: "${o.ocrDetected}"`);
    lines.push(`  Issue: ${o.discrepancyType} (Severity: ${o.severity})`);
  });

  lines.push('\n--------------------------------------------------------------------');
  lines.push('                   VERIFICATION RECOMMENDATIONS                     ');
  lines.push('--------------------------------------------------------------------');
  report.recommendations.forEach((rec, idx) => {
    lines.push(`${idx + 1}. ${rec}`);
  });

  lines.push('\n====================================================================');
  lines.push('DISCLAIMER: This report is an AI-assisted heuristic and forensic analysis designed to aid human document examiners. It does not replace physical laboratory forensic examination.');
  lines.push('====================================================================');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DataKriti_Authenticity_Audit_${docTitle.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports authenticity forensic report to JSON format.
 */
export function exportAuthenticityJson(
  report: AuthenticityReport,
  docTitle: string
): void {
  const exportData = {
    documentTitle: docTitle,
    report,
    system: 'DataKriti Forensic Document Intelligence System',
    version: '2.5.0',
    exportDate: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DataKriti_Authenticity_${docTitle.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports authenticity forensic report as a formal PDF audit dossier.
 */
export function exportAuthenticityPdf(
  report: AuthenticityReport,
  docTitle: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(214, 167, 108); // Gold
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DATAKRITI FORENSIC DOCUMENT INTELLIGENCE', 15, 12);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Authenticity & Digital Tampering Forensic Verification Dossier', 15, 20);

  cursorY = 36;

  // Verdict Banner
  let verdictColor = [22, 101, 52]; // Green
  let verdictBg = [220, 252, 231];
  if (report.classification === 'significant_suspicious_indicators') {
    verdictColor = [153, 27, 27];
    verdictBg = [254, 226, 226];
  } else if (report.classification === 'potential_inconsistencies') {
    verdictColor = [146, 64, 14];
    verdictBg = [254, 243, 199];
  }

  doc.setFillColor(verdictBg[0], verdictBg[1], verdictBg[2]);
  doc.roundedRect(15, cursorY, pageWidth - 30, 22, 2, 2, 'F');

  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`VERDICT: ${report.classification.replace(/_/g, ' ').toUpperCase()}`, 20, cursorY + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidence: ${report.confidenceScore}% | Regions Flagged: ${report.suspiciousRegions.length}`, 20, cursorY + 16);

  cursorY += 30;

  // Metadata Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Document Name:', 15, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.text(docTitle.substring(0, 60), 55, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Timestamp:', 15, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(report.analysisDate).toLocaleString(), 55, cursorY);

  cursorY += 10;

  // Executive Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, cursorY, pageWidth - 30, 28, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Forensic Summary (English):', 18, cursorY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(report.summaryStatementEnglish, pageWidth - 36);
  doc.text(splitSummary, 18, cursorY + 13);

  cursorY += 34;

  // Flagged Regions Section
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Flagged Anomalies & Suspicious Regions', 15, cursorY);
  cursorY += 6;

  report.suspiciousRegions.forEach((reg, idx) => {
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }

    const isHigh = reg.severity === 'high';
    doc.setFillColor(isHigh ? 254 : 254, isHigh ? 242 : 249, isHigh ? 242 : 195);
    doc.roundedRect(15, cursorY, pageWidth - 30, 22, 1.5, 1.5, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isHigh ? 153 : 146, isHigh ? 27 : 64, isHigh ? 27 : 14);
    doc.text(`#${idx + 1} [${reg.severity.toUpperCase()}] ${reg.title}`, 18, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const ev = doc.splitTextToSize(`Evidence: ${reg.evidence}`, pageWidth - 36);
    doc.text(ev, 18, cursorY + 10);

    const act = doc.splitTextToSize(`Action: ${reg.recommendation}`, pageWidth - 36);
    doc.text(act, 18, cursorY + 16);

    cursorY += 25;
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('DataKriti Digital Heritage & Forensic Document Verification System — Human In The Loop Protocol', 15, 290);

  doc.save(`DataKriti_Authenticity_Dossier_${Date.now()}.pdf`);
}
