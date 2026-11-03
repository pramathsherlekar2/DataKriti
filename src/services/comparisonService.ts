import { DocumentComparisonResult } from '../types';
import { compareDocumentsApi } from './api';
import { performLinguisticComparison } from './comparisonAndAuthenticityEngine';
import jsPDF from 'jspdf';

/**
 * Service to orchestrate Kannada document comparison and generate export reports.
 */
export async function compareDocuments(
  doc1Text: string,
  doc2Text: string,
  doc1Title = 'Original Document',
  doc2Title = 'Revised Document'
): Promise<DocumentComparisonResult> {
  try {
    const apiResult = await compareDocumentsApi(
      doc1Text,
      doc2Text,
      doc1Title,
      doc2Title
    );
    if (apiResult && apiResult.changes) {
      return apiResult;
    }
    throw new Error('API returned empty result');
  } catch (error) {
    console.warn('Backend compare endpoint unavailable or failed, utilizing local linguistic engine:', error);
    return performLinguisticComparison(
      doc1Text,
      doc2Text,
      doc1Title,
      doc2Title
    );
  }
}

/**
 * Generates and downloads a clean text summary comparison report.
 */
export function exportComparisonTxt(
  result: DocumentComparisonResult,
  docATitle: string,
  docBTitle: string
): void {
  const lines: string[] = [
    '====================================================================',
    '       DATAKRITI — SMART DOCUMENT COMPARISON & CHANGE REPORT        ',
    '       ಕನ್ನಡ ದಾಖಲೆ ವ್ಯತ್ಯಾಸ ಮತ್ತು ಬದಲಾವಣೆ ವಿಶ್ಲೇಷಣಾ ವರದಿ           ',
    '====================================================================',
    '',
    `Generated At: ${new Date(result.comparisonDate).toLocaleString()}`,
    `Base Document (A): ${docATitle} (ID: ${result.doc1Id})`,
    `Revised Document (B): ${docBTitle} (ID: ${result.doc2Id})`,
    '',
    '--------------------------------------------------------------------',
    '                       EXECUTIVE SUMMARY                            ',
    '--------------------------------------------------------------------',
    `Kannada: ${result.summary.overallAssessmentKannada}`,
    `English: ${result.summary.overallAssessmentEnglish}`,
    '',
    `Total Changes Detected: ${result.summary.totalChanges}`,
    ` - Added Clauses:       ${result.summary.addedCount}`,
    ` - Removed Clauses:     ${result.summary.removedCount}`,
    ` - Modified Clauses:    ${result.summary.modifiedCount}`,
    ` - Date Changes:        ${result.summary.dateChangesCount}`,
    ` - Deadline Changes:    ${result.summary.deadlineChangesCount}`,
    ` - Financial Changes:   ${result.summary.financialChangesCount}`,
    ` - Substantially Same:  ${result.summary.isSubstantiallyIdentical ? 'YES' : 'NO'}`,
    '',
    '--------------------------------------------------------------------',
    '                      DETAILED CHANGE LOG                           ',
    '--------------------------------------------------------------------',
  ];

  result.changes.forEach((change, idx) => {
    lines.push(`\n[CHANGE #${idx + 1}] Type: ${change.type.toUpperCase()} | Category: ${change.category.toUpperCase()}`);
    lines.push(`Significance: ${change.significance.toUpperCase()}`);
    lines.push(`Clause/Section: ${change.sectionName || 'N/A'}`);
    if (change.originalText) {
      lines.push(`Before (Doc A):\n  "${change.originalText}"`);
    }
    if (change.revisedText) {
      lines.push(`After (Doc B):\n  "${change.revisedText}"`);
    }
    lines.push(`Explanation (Kannada):\n  ${change.explanationKannada}`);
    lines.push(`Explanation (English):\n  ${change.explanationEnglish}`);
    if (change.impactReason) {
      lines.push(`Impact: ${change.impactReason}`);
    }
    lines.push('--------------------------------------------------------------------');
  });

  lines.push('\n====================================================================');
  lines.push('End of Report — DataKriti Digital Heritage & Document Intelligence');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DataKriti_Comparison_${docATitle.replace(/\s+/g, '_')}_vs_${docBTitle.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports comparison findings as a formatted PDF.
 */
export function exportComparisonPdf(
  result: DocumentComparisonResult,
  docATitle: string,
  docBTitle: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 20;

  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(214, 167, 108); // Gold accent
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DataKriti Document Intelligence', 15, 12);

  doc.setTextColor(240, 240, 240);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Kannada Document Comparison & Change Detection Report', 15, 20);

  cursorY = 38;

  // Metadata block
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Document A (Original):', 15, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.text(docATitle.substring(0, 50), 60, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Document B (Revised):', 15, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.text(docBTitle.substring(0, 50), 60, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Generated:', 15, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(result.comparisonDate).toLocaleString(), 60, cursorY);

  cursorY += 10;

  // Metrics Boxes
  const boxWidth = 40;
  const boxHeight = 16;
  const metrics = [
    { label: 'Total Changes', value: result.summary.totalChanges.toString(), color: [241, 245, 249] },
    { label: 'Added', value: result.summary.addedCount.toString(), color: [220, 252, 231] },
    { label: 'Removed', value: result.summary.removedCount.toString(), color: [254, 226, 226] },
    { label: 'Modified', value: result.summary.modifiedCount.toString(), color: [254, 243, 199] },
  ];

  metrics.forEach((m, i) => {
    const x = 15 + i * (boxWidth + 5);
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.roundedRect(x, cursorY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(m.label, x + 5, cursorY + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text(m.value, x + 5, cursorY + 13);
  });

  cursorY += boxHeight + 10;

  // Executive summary
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, cursorY, pageWidth - 30, 24, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary (English):', 18, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const splitSummary = doc.splitTextToSize(result.summary.overallAssessmentEnglish, pageWidth - 36);
  doc.text(splitSummary, 18, cursorY + 12);

  cursorY += 30;

  // Change table header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detected Changes Breakdown', 15, cursorY);
  cursorY += 6;

  result.changes.slice(0, 10).forEach((change, idx) => {
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }

    const typeBadge = change.type.toUpperCase();
    const isAdded = change.type === 'added';
    const isRemoved = change.type === 'removed';

    if (isAdded) doc.setFillColor(236, 253, 245);
    else if (isRemoved) doc.setFillColor(254, 242, 242);
    else doc.setFillColor(254, 249, 195);

    doc.roundedRect(15, cursorY, pageWidth - 30, 20, 1.5, 1.5, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`#${idx + 1} [${typeBadge}] ${change.category.toUpperCase()} — ${change.sectionName || 'Section'}`, 18, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const expl = doc.splitTextToSize(change.explanationEnglish, pageWidth - 36);
    doc.text(expl, 18, cursorY + 10);

    cursorY += 23;
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Document Analysis — Powered by DataKriti AI Intelligence System', 15, 290);

  doc.save(`DataKriti_Comparison_Report_${Date.now()}.pdf`);
}

/**
 * Exports comparison findings as an HTML-based document that opens in Microsoft Word (.docx).
 */
export function exportComparisonDocx(
  result: DocumentComparisonResult,
  docATitle: string,
  docBTitle: string
): void {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>DataKriti Document Comparison Report</title>
    <style>
      body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 40px; color: #1e293b; }
      h1 { color: #854d0e; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      h2 { color: #334155; margin-top: 24px; }
      .meta { background: #f8fafc; padding: 12px; border-left: 4px solid #d6a76c; margin-bottom: 20px; }
      .summary-box { background: #f1f5f9; padding: 16px; border-radius: 6px; font-weight: 500; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
      th { background: #f8fafc; }
      .badge-added { background: #dcfce7; color: #166534; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
      .badge-removed { background: #fee2e2; color: #991b1b; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
      .badge-modified { background: #fef3c7; color: #92400e; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
    </style>
    </head>
    <body>
      <h1>DataKriti — Kannada Document Comparison & Change Analysis</h1>
      <div class="meta">
        <p><strong>Original Document (A):</strong> ${docATitle}</p>
        <p><strong>Revised Document (B):</strong> ${docBTitle}</p>
        <p><strong>Generated:</strong> ${new Date(result.comparisonDate).toLocaleString()}</p>
        <p><strong>Total Changes:</strong> ${result.summary.totalChanges} (Added: ${result.summary.addedCount}, Removed: ${result.summary.removedCount}, Modified: ${result.summary.modifiedCount})</p>
      </div>

      <h2>Executive Summary</h2>
      <div class="summary-box">
        <p><strong>Kannada:</strong> ${result.summary.overallAssessmentKannada}</p>
        <p><strong>English:</strong> ${result.summary.overallAssessmentEnglish}</p>
      </div>

      <h2>Detailed Changes</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Category</th>
            <th>Section</th>
            <th>Original Text (Doc A)</th>
            <th>Revised Text (Doc B)</th>
            <th>Explanation (English)</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          ${result.changes.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><span class="badge-${c.type}">${c.type.toUpperCase()}</span></td>
              <td>${c.category}</td>
              <td>${c.sectionName || 'N/A'}</td>
              <td>${c.originalText ? `<em>${c.originalText}</em>` : '-'}</td>
              <td>${c.revisedText ? `<strong>${c.revisedText}</strong>` : '-'}</td>
              <td>${c.explanationEnglish}</td>
              <td>${c.impactReason || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DataKriti_Comparison_${Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
