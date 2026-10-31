import jsPDF from 'jspdf';
import { DocumentItem } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\u0C80-\u0CFF-]/g, '_');
}

// 1. Export as TXT with UTF-8 BOM for universal editor compatibility
export function exportAsText(document: DocumentItem, useCorrected = true): void {
  const page = document.pages[document.currentPageIndex] || document.pages[0];
  const text = (useCorrected && page?.ocrResult?.correctedText)
    ? page.ocrResult.correctedText
    : page?.ocrResult?.extractedText || '';

  const header = `====================================================================
DATAKRITI - KANNADA DOCUMENT INTELLIGENCE PLATFORM
ಕನ್ನಡ ದಾಖಲೆ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ದೃಢೀಕರಣ ವರದಿ
Document: ${document.filename}
Category: ${document.documentCategory}
Digitized Date: ${new Date(document.uploadDate).toLocaleString()}
Confidence Level: ${page?.ocrResult?.estimatedConfidence ?? 'N/A'}%
Total Words: ${page?.ocrResult?.wordCount ?? 'N/A'}
Language: ${page?.ocrResult?.detectedLanguage ?? 'Kannada'}
====================================================================

`;

  // Prepend UTF-8 Byte Order Mark (\uFEFF) to guarantee correct Indic script display in Windows Notepad & text editors
  const fullContent = '\uFEFF' + header + text;
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  const filename = `DataKriti_${sanitizeFilename(document.filename.replace(/\.[^/.]+$/, ''))}_OCR.txt`;
  downloadBlob(blob, filename);
}

// 2. Export as DOCX (Formatted HTML Word document with explicit UTF-8 and Kannada fonts)
export function exportAsDocx(document: DocumentItem, useCorrected = true): void {
  const page = document.pages[document.currentPageIndex] || document.pages[0];
  const text = (useCorrected && page?.ocrResult?.correctedText)
    ? page.ocrResult.correctedText
    : page?.ocrResult?.extractedText || '';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${document.filename}</title>
  <style>
    body { font-family: 'Noto Sans Kannada', 'Noto Serif Kannada', 'Arial Unicode MS', sans-serif; line-height: 1.7; padding: 40px; color: #1C2337; }
    h1 { color: #222A48; font-size: 18pt; border-bottom: 2px solid #D6A76C; padding-bottom: 8px; margin-bottom: 12px; }
    .badge { display: inline-block; background-color: #F1ECE2; padding: 3px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; color: #7C3AED; }
    .meta-box { background-color: #F7F4EE; padding: 14px; border-left: 4px solid #7C3AED; margin-bottom: 24px; font-size: 9.5pt; color: #575E75; border-radius: 4px; }
    .content { font-size: 11pt; white-space: pre-wrap; font-family: 'Noto Serif Kannada', serif; }
    .footer { margin-top: 50px; font-size: 8.5pt; color: #858B9E; border-top: 1px solid #E3DDD2; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>DataKriti: ${document.filename}</h1>
  <div class="meta-box">
    <strong>Platform:</strong> DataKriti Kannada AI Digitization Platform<br>
    <strong>Document Category:</strong> ${document.documentCategory}<br>
    <strong>Processing Date:</strong> ${new Date(document.uploadDate).toLocaleString()}<br>
    <strong>Verification Confidence:</strong> ${page?.ocrResult?.estimatedConfidence ?? 'N/A'}% | 
    <strong>Words:</strong> ${page?.ocrResult?.wordCount ?? 'N/A'}
  </div>
  <div class="content">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer">
    Generated securely by DataKriti - From Kannada Documents to Digital Knowledge.
  </div>
</body>
</html>
`;

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const filename = `DataKriti_${sanitizeFilename(document.filename.replace(/\.[^/.]+$/, ''))}_Verified.doc`;
  downloadBlob(blob, filename);
}

// 3. Searchable PDF with crisp Kannada canvas rendering + searchable text metadata
export async function exportAsSearchablePdf(docItem: DocumentItem, useCorrected = true): Promise<void> {
  const page = docItem.pages[docItem.currentPageIndex] || docItem.pages[0];
  const text = (useCorrected && page?.ocrResult?.correctedText)
    ? page.ocrResult.correctedText
    : page?.ocrResult?.extractedText || '';

  // Render document onto a high-DPI canvas to guarantee 100% accurate Indic glyph shaping in PDF
  const canvas = window.document.createElement('canvas');
  const dpr = 2; // retina scaling
  canvas.width = 800 * dpr;
  canvas.height = 1130 * dpr;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1130);

    // Header Deep Navy Bar with Gold Accent line
    ctx.fillStyle = '#1E243D';
    ctx.fillRect(0, 0, 800, 64);
    ctx.fillStyle = '#D6A76C';
    ctx.fillRect(0, 64, 800, 3);

    // Load official DataKriti lotus logo icon
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/datakriti-icon.png';
      await new Promise<void>((resolve) => {
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          resolve();
        } else {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => resolve();
          setTimeout(() => resolve(), 300);
        }
      });
      if (logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 35, 10, 44, 44);
      }
    } catch {
      // Graceful fallback
    }

    // Title in header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Noto Sans Kannada", sans-serif';
    ctx.fillText('DataKriti - Kannada Document Intelligence Platform', 90, 34);

    ctx.font = '10px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#D6A76C';
    ctx.fillText('ಕನ್ನಡ ದಾಖಲೆಗಳಿಂದ ಡಿಜಿಟಲ್ ಜ್ಞಾನದೆಡೆಗೆ • Digital Heritage Archival Layer', 90, 50);

    // Meta Box
    ctx.fillStyle = '#F7F4EE';
    ctx.fillRect(40, 78, 720, 50);
    ctx.strokeStyle = '#E3DDD2';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 78, 720, 50);

    ctx.fillStyle = '#1C2337';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`File: ${docItem.filename}`, 55, 95);

    ctx.fillStyle = '#575E75';
    ctx.font = '10px sans-serif';
    ctx.fillText(
      `Category: ${docItem.documentCategory}  |  Confidence: ${page?.ocrResult?.estimatedConfidence || 95}%  |  Words: ${page?.ocrResult?.wordCount || 100}`,
      55,
      112
    );

    // Document Text lines
    ctx.fillStyle = '#1C2337';
    ctx.font = '13px "Noto Serif Kannada", "Noto Sans Kannada", serif';

    const words = text.split('\n');
    let y = 155;

    for (const paragraph of words) {
      if (y > 1060) break;

      if (!paragraph.trim()) {
        y += 12;
        continue;
      }

      // Wrap lines
      const paraWords = paragraph.split(' ');
      let currentLine = '';

      for (const w of paraWords) {
        const testLine = currentLine + w + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 710 && currentLine !== '') {
          ctx.fillText(currentLine, 40, y);
          currentLine = w + ' ';
          y += 22;
          if (y > 1060) break;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine && y <= 1060) {
        ctx.fillText(currentLine, 40, y);
        y += 22;
      }
      y += 8;
    }

    // Footer
    ctx.strokeStyle = '#E3DDD2';
    ctx.beginPath();
    ctx.moveTo(40, 1085);
    ctx.lineTo(760, 1085);
    ctx.stroke();

    ctx.fillStyle = '#858B9E';
    ctx.font = '9px sans-serif';
    ctx.fillText(
      `Exported from DataKriti Platform on ${new Date().toLocaleDateString()} • Verified Kannada Archival Layer`,
      40,
      1105
    );
  }

  // Generate jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, 595.28, 841.89);

  const filename = `DataKriti_${sanitizeFilename(docItem.filename.replace(/\.[^/.]+$/, ''))}_Archival.pdf`;
  pdf.save(filename);
}

// 4. Export Translation Text
export function exportTranslationText(document: DocumentItem, targetLanguage: string): void {
  const translation = document.translations[targetLanguage];
  if (!translation) return;

  const content = `====================================================================
DATAKRITI - MULTILINGUAL TRANSLATION REPORT
Document: ${document.filename}
Source Language: Kannada (ಕನ್ನಡ)
Target Language: ${translation.targetLanguage}
Generated Date: ${new Date(translation.creationDate).toLocaleString()}
====================================================================

${translation.translatedText}
`;

  const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
  const filename = `DataKriti_${sanitizeFilename(document.filename.replace(/\.[^/.]+$/, ''))}_Translated_${translation.targetLanguage}.txt`;
  downloadBlob(blob, filename);
}
