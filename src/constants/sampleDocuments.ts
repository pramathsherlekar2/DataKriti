import { DocumentItem } from '../types';

// Helper to generate a realistic document canvas data URL
function createSampleDocumentImage(title: string, subTitle: string, lines: string[], sealText: string, degraded = false): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - aged parchment or ivory official paper
  ctx.fillStyle = degraded ? '#EDE6D6' : '#FAF8F5';
  ctx.fillRect(0, 0, 800, 1100);

  // Subtle paper texture / noise if degraded
  if (degraded) {
    ctx.fillStyle = 'rgba(120, 95, 60, 0.05)';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(Math.random() * 800, Math.random() * 1100, Math.random() * 200 + 50, Math.random() * 20);
    }
    // subtle fade gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 1100);
    grad.addColorStop(0, 'rgba(0,0,0,0.02)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    grad.addColorStop(1, 'rgba(100,70,30,0.08)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1100);
  }

  // Border
  ctx.strokeStyle = degraded ? '#B8A88E' : '#D5CBB9';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 740, 1040);
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 728, 1028);

  // Official Emblem / Seal representation
  ctx.beginPath();
  ctx.arc(400, 85, 34, 0, Math.PI * 2);
  ctx.strokeStyle = '#8B263E';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#8B263E';
  ctx.font = 'bold 10px "Noto Sans Kannada", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ಕರ್ನಾಟಕ ಸರ್ಕಾರ', 400, 80);
  ctx.fillText('GOVT OF KARNATAKA', 400, 95);

  // Header Title
  ctx.fillStyle = degraded ? '#333028' : '#1C2337';
  ctx.font = 'bold 20px "Noto Serif Kannada", serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 400, 155);

  // Subtitle
  ctx.font = '13px "Noto Sans Kannada", sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(subTitle, 400, 185);

  // Horizontal divider
  ctx.strokeStyle = '#D1D5DB';
  ctx.beginPath();
  ctx.moveTo(60, 205);
  ctx.lineTo(740, 205);
  ctx.stroke();

  // Document lines
  ctx.textAlign = 'left';
  ctx.fillStyle = degraded ? '#2C2B27' : '#1F2937';
  let y = 245;

  lines.forEach((line) => {
    if (line.startsWith('## ')) {
      ctx.font = 'bold 16px "Noto Serif Kannada", serif';
      ctx.fillStyle = '#111827';
      y += 10;
      ctx.fillText(line.replace('## ', ''), 60, y);
      y += 26;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      ctx.font = 'bold 13px "Noto Sans Kannada", sans-serif';
      ctx.fillStyle = '#1F2937';
      ctx.fillText(line.replace(/\*\*/g, ''), 60, y);
      y += 22;
    } else {
      ctx.font = '13px "Noto Sans Kannada", sans-serif';
      ctx.fillStyle = degraded ? '#36342E' : '#374151';

      // Simple line wrapping
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 670 && currentLine !== '') {
          ctx.fillText(currentLine, 60, y);
          currentLine = word + ' ';
          y += 22;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        ctx.fillText(currentLine, 60, y);
        y += 22;
      }
      y += 8;
    }
  });

  // Seal at bottom
  ctx.beginPath();
  ctx.arc(650, 950, 45, 0, Math.PI * 2);
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#2563EB';
  ctx.font = '10px "Noto Sans Kannada", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sealText, 650, 945);
  ctx.fillText('ಅಧಿಕೃತ ಮುದ್ರೆ', 650, 960);

  // Signature line
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 12px "Noto Sans Kannada", sans-serif';
  ctx.fillText('ವಿಶೇಷ ಕರ್ತವ್ಯಾಧಿಕಾರಿ ಹಾಗೂ ಸರ್ಕಾರದ ಅಪರ ಕಾರ್ಯದರ್ಶಿ', 720, 1010);
  ctx.font = '11px "Noto Sans Kannada", sans-serif';
  ctx.fillText('ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ, ಬೆಂಗಳೂರು', 720, 1028);

  return canvas.toDataURL('image/jpeg', 0.92);
}

// Generate the 3 rich sample documents
export function getInitialSampleDocuments(): DocumentItem[] {
  // If running in browser environment, generate real canvas images
  const canUseCanvas = typeof document !== 'undefined';

  const doc1Image = canUseCanvas
    ? createSampleDocumentImage(
        'ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಅಧಿಕೃತ ಸುತ್ತೋಲೆ',
        'ಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬, ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬',
        [
          '## ವಿಷಯ: ರಾಜ್ಯಾದ್ಯಂತ ನಾಗರಿಕ ಸೇವೆಗಳ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ನಿಗದಿ ಕುರಿತು.',
          'ಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ ಡಿಪಿಎಆರ್/೨೨/ಇ-ಆಡಳಿತ/೨೦೨೫, ದಿನಾಂಕ: ೦೧-೦೮-೨೦೨೫.',
          'ಪ್ರಸ್ತಾವನೆ:',
          'ರಾಜ್ಯದ ಎಲ್ಲಾ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳಲ್ಲಿ ಸಾರ್ವಜನಿಕರಿಗೆ ಒದಗಿಸಲಾಗುವ ಕಂದಾಯ, ಜಾತಿ, ಆದಾಯ ಮತ್ತು ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಕಾಲಮಿತಿಯೊಳಗೆ ವಿತರಿಸಲು ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸಲಾಗಿದೆ.',
          '**ಮುಖ್ಯ ಆದೇಶಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು:**',
          '೧. ಎಲ್ಲಾ ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸಿ, ಸ್ವೀಕೃತಿ ರಸೀದಿಯನ್ನು (Acknowledgement Slip) ಅರ್ಜಿದಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಎಸ್‌ಎಂಎಸ್ ಮೂಲಕ ರವಾನಿಸತಕ್ಕದ್ದು.',
          '೨. ಯಾವುದೇ ಅರ್ಜಿಯನ್ನು ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ. ವಿಳಂಬಕ್ಕೆ ಸಂಬಂಧಪಟ್ಟ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವೇ ನೇರ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ.',
          '೩. ಅರ್ಹ ಫಲಾನುಭವಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿರುವ ಇ-ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನಿಗದಿತ ಶುಲ್ಕ ₹೨೫ ಮಾತ್ರ ಪಡೆದು ವಿತರಿಸಬೇಕು.',
          '೪. ಅರ್ಜಿ ತಿರಸ್ಕೃತಗೊಂಡಲ್ಲಿ, ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ ಲಿಖಿತ ಆದೇಶವನ್ನು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡತಕ್ಕದ್ದು.',
          '**ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ:** ೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ವಿಲೇವಾರಿ ಮಾಡತಕ್ಕದ್ದು.',
          'ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬ | ಇಮೇಲ್: support-edistrict@karnataka.gov.in',
        ],
        'ಕಂದಾಯ ಆಯುಕ್ತಾಲಯ'
      )
    : '';

  const doc2Image = canUseCanvas
    ? createSampleDocumentImage(
        'ಕನ್ನಡ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ - ಪ್ರಾಚೀನ ಶಾಸನ ಪರಿಶೀಲನಾ ವರದಿ',
        'ಸಂಪುಟ: ೧೪, ಕ್ರಿ.ಶ. ೧೫೨೨ ರ ಕೃಷ್ಣದೇವರಾಯರ ಕಾಲದ ಹಂಪಿಯ ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ ಶಾಸನ',
        [
          '## ವಿಷಯ: ಹಂಪಿಯ ರಾಯಗೋಪುರ ನಿರ್ಮಾಣ ಮತ್ತು ಧರ್ಮದಾನ ವಿವರಣೆ ಕುರಿತ ಶಿಲಾಶಾಸನ.',
          'ಲಿಪಿ ಸ್ವರೂಪ: ಪ್ರಾಚೀನ ಮಧ್ಯಕಾಲೀನ ಕನ್ನಡ ಲಿಪಿ ಮತ್ತು ಸಾಹಿತ್ಯಕ ಶೈಲಿ (ಹಳಗನ್ನಡ ಛಾಯೆ).',
          'ಪ್ರಸ್ತಾವನೆ:',
          'ಶ್ರೀಮನ್ ಮಹಾರಾಜಾಧಿರಾಜ ರಾಜಪರಮೇಶ್ವರ ವೀರಪ್ರತಾಪ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ ರಾಜ್ಯಭಾರ ಮಾಡುತ್ತಿದ್ದ ಕಾಲದಲ್ಲಿ ಈ ಧರ್ಮಶಾಸನವನ್ನು ಬರೆಯಲಾಯಿತು.',
          '**ಶಾಸನದ ಮುಖ್ಯ ಸಾರಾಂಶ:**',
          'ಸ್ವಸ್ತಿ ಶ್ರೀ ವಿಜಯಾಭ್ಯುದಯ ಶಾಲಿವಾಹನ ಶಕವರ್ಷ ೧೪೪೪ ನೇ ವಿಕ್ರಮ ಸಂವತ್ಸರದ ವೈಶಾಖ ಶುದ್ಧ ಪೌರ್ಣಮಿ ಪುಣ್ಯಕಾಲದಲ್ಲಿ ಮಹಾರಾಯರು ಪಂಪಾಪತಿ ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿ ಸಮರ್ಪಿಸಿದರು.',
          'ದೇವಾಲಯದ ನಿತ್ಯ ನೈವೇದ್ಯ ಮತ್ತು ನಂದಾದೀಪ ಸೇವೆಗಾಗಿ ತುಂಗಭದ್ರಾ ನದಿಯ ತೀರದ ಮೂರು ಫಲವತ್ತಾದ ಕೃಷಿ ಗ್ರಾಮಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಸರ್ವಮಾನ್ಯ ದಾನವಾಗಿ ನೀಡಲಾಗಿದೆ.',
          'ಈ ದಾನವನ್ನು ಯಾರಾದರೂ ಅಪಹರಿಸಿದರೆ ಅಥವಾ ಅಡ್ಡಿಪಡಿಸಿದರೆ ಅವರು ಗಂಗಾತೀರದಲ್ಲಿ ಗೋಹತ್ಯೆ ಮಾಡಿದ ಮಹಾಪಾಪಕ್ಕೆ ಗುರಿಯಾಗುವರೆಂದು ಶಾಸನೋಕ್ತ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.',
          'ಸ್ಥಳ: ಹಂಪಿ, ಬಳ್ಳಾರಿ ಜಿಲ್ಲೆ (ಪ್ರಸ್ತುತ ವಿಜಯನಗರ ಜಿಲ್ಲೆ), ಕರ್ನಾಟಕ ರಾಜ್ಯ.',
        ],
        'ಕರ್ನಾಟಕ ಇತಿಹಾಸ ಅಕಾಡೆಮಿ',
        true
      )
    : '';

  const doc1ExtractedText = `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ
ಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬, ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬

ವಿಷಯ: ರಾಜ್ಯಾದ್ಯಂತ ನಾಗರಿಕ ಸೇವೆಗಳ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ನಿಗದಿ ಕುರಿತು.

ಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ ಡಿಪಿಎಆರ್/೨೨/ಇ-ಆಡಳಿತ/೨೦೨೫, ದಿನಾಂಕ: ೦೧-೦೮-೨೦೨೫.

ಪ್ರಸ್ತಾವನೆ:
ರಾಜ್ಯದ ಎಲ್ಲಾ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳಲ್ಲಿ ಸಾರ್ವಜನಿಕರಿಗೆ ಒದಗಿಸಲಾಗುವ ಕಂದಾಯ, ಜಾತಿ, ಆದಾಯ ಮತ್ತು ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಕಾಲಮಿತಿಯೊಳಗೆ ವಿತರಿಸಲು ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸಲಾಗಿದೆ.

ಮುಖ್ಯ ಆದೇಶಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು:
೧. ಎಲ್ಲಾ ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸಿ, ಸ್ವೀಕೃತಿ ರಸೀದಿಯನ್ನು (Acknowledgement Slip) ಅರ್ಜಿದಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಎಸ್‌ಎಂಎಸ್ ಮೂಲಕ ರವಾನಿಸತಕ್ಕದ್ದು.
೨. ಯಾವುದೇ ಅರ್ಜಿಯನ್ನು ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ. ವಿಳಂಬಕ್ಕೆ ಸಂಬಂಧಪಟ್ಟ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವೇ ನೇರ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ.
೩. ಅರ್ಹ ಫಲಾನುಭವಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿರುವ ಇ-ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನಿಗದಿತ ಶುಲ್ಕ ₹೨೫ ಮಾತ್ರ ಪಡೆದು ವಿತರಿಸಬೇಕು.
೪. ಅರ್ಜಿ ತಿರಸ್ಕೃತಗೊಂಡಲ್ಲಿ, ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ ಲಿಖಿತ ಆದೇಶವನ್ನು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡತಕ್ಕದ್ದು.

ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ: ೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ವಿಲೇವಾರಿ ಮಾಡತಕ್ಕದ್ದು.

ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬ | ಇಮೇಲ್: support-edistrict@karnataka.gov.in

ವಿಶೇಷ ಕರ್ತವ್ಯಾಧಿಕಾರಿ ಹಾಗೂ ಸರ್ಕಾರದ ಅಪರ ಕಾರ್ಯದರ್ಶಿ
ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ, ಬೆಂಗಳೂರು`;

  const doc2ExtractedText = `ಕನ್ನಡ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ
ಸಂಪುಟ: ೧೪, ಕ್ರಿ.ಶ. ೧೫೨೨ ರ ಕೃಷ್ಣದೇವರಾಯರ ಕಾಲದ ಹಂಪಿಯ ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ ಶಾಸನ

ವಿಷಯ: ಹಂಪಿಯ ರಾಯಗೋಪುರ ನಿರ್ಮಾಣ ಮತ್ತು ಧರ್ಮದಾನ ವಿವರಣೆ ಕುರಿತ ಶಿಲಾಶಾಸನ.
ಲಿಪಿ ಸ್ವರೂಪ: ಪ್ರಾಚೀನ ಮಧ್ಯಕಾಲೀನ ಕನ್ನಡ ಲಿಪಿ ಮತ್ತು ಸಾಹಿತ್ಯಕ ಶೈಲಿ (ಹಳಗನ್ನಡ ಛಾಯೆ).

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀಮನ್ ಮಹಾರಾಜಾಧಿರಾಜ ರಾಜಪರಮೇಶ್ವರ ವೀರಪ್ರತಾಪ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ ರಾಜ್ಯಭಾರ ಮಾಡುತ್ತಿದ್ದ ಕಾಲದಲ್ಲಿ ಈ ಧರ್ಮಶಾಸನವನ್ನು ಬರೆಯಲಾಯಿತು.

ಶಾಸನದ ಮುಖ್ಯ ಸಾರಾಂಶ:
ಸ್ವಸ್ತಿ ಶ್ರೀ ವಿಜಯಾಭ್ಯುದಯ ಶಾಲಿವಾಹನ ಶಕವರ್ಷ ೧೪೪೪ ನೇ ವಿಕ್ರಮ ಸಂವತ್ಸರದ ವೈಶಾಖ ಶುದ್ಧ ಪೌರ್ಣಮಿ ಪುಣ್ಯಕಾಲದಲ್ಲಿ ಮಹಾರಾಯರು ಪಂಪಾಪತಿ ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿ ಸಮರ್ಪಿಸಿದರು.
ದೇವಾಲಯದ ನಿತ್ಯ ನೈವೇದ್ಯ ಮತ್ತು ನಂದಾದೀಪ ಸೇವೆಗಾಗಿ ತುಂಗಭದ್ರಾ ನದಿಯ ತೀರದ ಮೂರು ಫಲವತ್ತಾದ ಕೃಷಿ ಗ್ರಾಮಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಸರ್ವಮಾನ್ಯ ದಾನವಾಗಿ ನೀಡಲಾಗಿದೆ.
ಈ ದಾನವನ್ನು ಯಾರಾದರೂ ಅಪಹರಿಸಿದರೆ ಅಥವಾ ಅಡ್ಡಿಪಡಿಸಿದರೆ ಅವರು ಗಂಗಾತೀರದಲ್ಲಿ ಗೋಹತ್ಯೆ ಮಾಡಿದ ಮಹಾಪಾಪಕ್ಕೆ ಗುರಿಯಾಗುವರೆಂದು ಶಾಸನೋಕ್ತ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.

ಸ್ಥಳ: ಹಂಪಿ, ಬಳ್ಳಾರಿ ಜಿಲ್ಲೆ (ಪ್ರಸ್ತುತ ವಿಜಯನಗರ ಜಿಲ್ಲೆ), ಕರ್ನಾಟಕ ರಾಜ್ಯ.`;

  return [
    {
      id: 'doc-gov-circ-001',
      filename: 'Karnataka_Govt_Circular_48_2026.jpg',
      fileType: 'image/jpeg',
      uploadDate: new Date().toISOString(),
      fileSizeFormatted: '1.4 MB',
      pageCount: 1,
      documentCategory: 'Government Document',
      processingStatus: 'ready',
      isFavourite: true,
      currentPageIndex: 0,
      pages: [
        {
          pageNumber: 1,
          originalImage: doc1Image,
          ocrResult: {
            extractedText: doc1ExtractedText,
            correctedText: doc1ExtractedText,
            detectedLanguage: 'Kannada & English',
            wordCount: 172,
            estimatedConfidence: 96,
            paragraphs: [
              {
                id: 'p1',
                text: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ\nಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ\nಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬, ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬',
                type: 'heading',
                boundingBox: [50, 60, 180, 940],
              },
              {
                id: 'p2',
                text: 'ವಿಷಯ: ರಾಜ್ಯಾದ್ಯಂತ ನಾಗರಿಕ ಸೇವೆಗಳ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ನಿಗದಿ ಕುರಿತು.\nಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ ಡಿಪಿಎಆರ್/೨೨/ಇ-ಆಡಳಿತ/೨೦೨೫, ದಿನಾಂಕ: ೦೧-೦೮-೨೦೨೫.',
                type: 'heading',
                boundingBox: [210, 60, 310, 940],
              },
              {
                id: 'p3',
                text: 'ಪ್ರಸ್ತಾವನೆ: ರಾಜ್ಯದ ಎಲ್ಲಾ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳಲ್ಲಿ ಸಾರ್ವಜನಿಕರಿಗೆ ಒದಗಿಸಲಾಗುವ ಕಂದಾಯ, ಜಾತಿ, ಆದಾಯ ಮತ್ತು ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಕಾಲಮಿತಿಯೊಳಗೆ ವಿತರಿಸಲು ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸಲಾಗಿದೆ.',
                type: 'body',
                boundingBox: [320, 60, 440, 940],
              },
              {
                id: 'p4',
                text: 'ಮುಖ್ಯ ಆದೇಶಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು:\n೧. ಎಲ್ಲಾ ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸಿ, ಸ್ವೀಕೃತಿ ರಸೀದಿಯನ್ನು ಅರ್ಜಿದಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಎಸ್‌ಎಂಎಸ್ ಮೂಲಕ ರವಾನಿಸತಕ್ಕದ್ದು.\n೨. ಯಾವುದೇ ಅರ್ಜಿಯನ್ನು ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ. ವಿಳಂಬಕ್ಕೆ ಸಂಬಂಧಪಟ್ಟ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವೇ ನೇರ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ.\n೩. ಅರ್ಹ ಫಲಾನುಭವಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿರುವ ಇ-ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನಿಗದಿತ ಶುಲ್ಕ ₹೨೫ ಮಾತ್ರ ಪಡೆದು ವಿತರಿಸಬೇಕು.\n೪. ಅರ್ಜಿ ತಿರಸ್ಕೃತಗೊಂಡಲ್ಲಿ, ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ ಲಿಖಿತ ಆದೇಶವನ್ನು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡತಕ್ಕದ್ದು.',
                type: 'body',
                boundingBox: [450, 60, 750, 940],
              },
              {
                id: 'p5',
                text: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ: ೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ವಿಲೇವಾರಿ ಮಾಡತಕ್ಕದ್ದು.\nಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬ | ಇಮೇಲ್: support-edistrict@karnataka.gov.in',
                type: 'body',
                boundingBox: [760, 60, 890, 940],
              },
              {
                id: 'p6',
                text: 'ವಿಶೇಷ ಕರ್ತವ್ಯಾಧಿಕಾರಿ ಹಾಗೂ ಸರ್ಕಾರದ ಅಪರ ಕಾರ್ಯದರ್ಶಿ\nಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ, ಬೆಂಗಳೂರು',
                type: 'signature',
                boundingBox: [900, 450, 980, 940],
              },
            ],
            uncertainWords: [
              {
                word: 'ಸೇಸು',
                suggestedAlternatives: ['ಸೇವೆಗಳು', 'ಸೇವಾ'],
                confidenceLevel: 'medium',
                reason: 'Official file abbreviation for ಸೇವಾ ಸುಧಾರಣೆ (Service Reforms)',
              },
              {
                word: 'ಕಡತಗಳನ್ನು',
                suggestedAlternatives: ['ಕಡತಗಳನ್ನು', 'ಪತ್ರಗಳನ್ನು'],
                confidenceLevel: 'high',
                reason: 'Compound Kannada ottakshara with letter ಗಳನ್ನು',
              },
            ],
          },
        },
      ],
      recoveryAssessment: {
        qualityScore: 92,
        overallCondition: 'Good',
        blurLevel: 'None',
        contrastQuality: 'High',
        skewAngleEstimateDegrees: 0.1,
        lightingUniformity: 'Uniform',
        detectedIssues: [
          {
            issue: 'Small subscript diacritics in official file numbers',
            severity: 'low',
            description: 'The Kannada numerals ೪೮ and compound ligature ರ್ಕ require standard zoom for verified reading.',
          },
        ],
        recommendedEnhancements: [
          {
            operation: 'contrast',
            suggestedValue: 12,
            reason: 'Enhance sharp edge definition for Kannada ottakshara in small fonts.',
          },
        ],
      },
      translations: {
        English: {
          id: 'trans-en-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'English',
          translatedText: `GOVERNMENT OF KARNATAKA
Department of Personnel and Administrative Reforms
Number: DPAR 48 SR 2026, Vidhana Soudha, Bengaluru, Date: 15-10-2026

Subject: Regarding the statewide digitization of citizen services and fixing a time limit for application disposal.

Reference: Government Order No. DPAR/22/e-Gov/2025, Date: 01-08-2025.

Preamble:
Digital technology has been made mandatory to distribute revenue, caste, income, and domicile certificates to the public across all district and taluk centres of the state within a designated timeframe.

Key Directives and Guidelines:
1. All citizen applications must compulsorily be received through the Seva Sindhu portal, and an Acknowledgement Slip must be transmitted via SMS to the applicant's mobile number.
2. No application shall be kept pending for more than 15 days without valid grounds. The concerned competent authority will be directly held accountable for delays.
3. Digitally signed e-certificates must be issued to eligible beneficiaries by collecting only the prescribed fee of ₹25.
4. In case of application rejection, a written speaking order clearly stating the reason must be uploaded to the portal.

Deadline: All pending files must be disposed of before 30-11-2026.
Helpline: 1800-425-8666 | Email: support-edistrict@karnataka.gov.in

Officer on Special Duty & Additional Secretary to Government
Department of Personnel & Administrative Reforms, Bengaluru`,
          keyVocabulary: [
            { kannada: 'ಸುತ್ತೋಲೆ', translation: 'Circular', meaningInEnglish: 'Official administrative instruction' },
            { kannada: 'ಸೇವಾಸಿಂಧು', translation: 'Seva Sindhu', meaningInEnglish: 'Karnataka government citizen services portal' },
            { kannada: 'ವಿಲೇವಾರಿ', translation: 'Disposal / Resolution', meaningInEnglish: 'Final processing and decision on a file' },
            { kannada: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ', translation: 'Competent Authority', meaningInEnglish: 'Designated official with legal sanction' },
          ],
          translationNotes: 'Formal administrative terms adapted into standard Indian governance terminology.',
          creationDate: new Date().toISOString(),
        },
        Marathi: {
          id: 'trans-mr-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Marathi',
          translatedText: `कर्नाटक शासन
कर्मचारी आणि प्रशासकीय सुधारणा विभाग
क्रमांक: सिआसुइ ४८ सेसु २०२६, विधान सौध, बेंगळुरू, दिनांक: १५-१०-२०२६

विषय: राज्यभरात नागरिक सेवांचे डिजिटलायझेशन आणि अर्जांची विल्हेवाट लावण्यासाठी कालमर्यादा निश्चित करणेबाबत.

संदर्भ: शासन निर्णय क्रमांक डीपीएआर/२२/ई-प्रशासन/२०२५, दिनांक: ०१-०८-२०२५.

प्रस्तावना:
राज्यातील सर्व जिल्हा व तालुका केंद्रांमध्ये नागरिकांना महसूल, जात, उत्पन्न आणि रहिवासी प्रमाणपत्रे विहित मुदतीत वितरीत करण्यासाठी डिजिटल तंत्रज्ञान अनिवार्य करण्यात आले आहे.

मुख्य आदेश आणि मार्गदर्शक तत्त्वे:
१. सर्व नागरिकांचे अर्ज अनिवार्यपणे सेवा सिंधू पोर्टलद्वारेच स्वीकारले जावेत आणि पावती अर्जदाराच्या मोबाईल क्रमांकावर एसएमएसद्वारे पाठवली जावी.
२. कोणताही अर्ज विनाकारण १५ दिवसांपेक्षा जास्त प्रलंबित ठेवता येणार नाही. विलंबासाठी संबंधित सक्षम अधिकारी थेट जबाबदार असतील.
३. पात्र लाभार्थ्यांना डिजिटल स्वाक्षरी असलेली ई-प्रमाणपत्रे केवळ ₹२५ चे विहित शुल्क आकारून वितरित केली जावीत.
४. अर्ज नाकारल्यास त्याचे स्पष्ट कारण नमूद करून लेखी आदेश पोर्टलवर अपलोड करावा.

अंतिम मुदत: ३०-११-२०२६ पूर्वी सर्व प्रलंबित नस्त्यांची विल्हेवाट लावली जावी.
हेल्पलाइन: १८००-४२५-८६६६ | ईमेल: support-edistrict@karnataka.gov.in

विशेष कर्तव्य अधिकारी तथा शासनाचे अप्पर सचिव
कर्मचारी आणि प्रशासकीय सुधारणा विभाग, बेंगळुरू`,
          keyVocabulary: [
            { kannada: 'ಸುತ್ತೋಲೆ', translation: 'परिपत्रक', meaningInEnglish: 'Official circular' },
            { kannada: 'ವಿಲೇವಾರಿ', translation: 'विल्हेवाट', meaningInEnglish: 'Disposal of files' },
            { kannada: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ', translation: 'सक्षम अधिकारी', meaningInEnglish: 'Competent administrative authority' },
          ],
          creationDate: new Date().toISOString(),
        },
        Hindi: {
          id: 'trans-hi-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Hindi',
          translatedText: `कर्नाटक सरकार
कार्मिक एवं प्रशासनिक सुधार विभाग
संख्या: सिआसुइ ४८ सेसु २०२६, विधान सौध, बेंगलुरु, दिनांक: १५-१०-२०२६

विषय: राज्यभर में नागरिक सेवाओं का डिजिटलीकरण और आवेदनों के निपटारे की समय-सीमा तय करने के संबंध में।

संदर्भ: सरकारी आदेश संख्या डीपीएआर/२२/ई-प्रशासन/२०२५, दिनांक: ०१-०८-२०२५।

प्रस्तावना:
राज्य के सभी जिला और तालुक मुख्यालयों में आम जनता को राजस्व, जाति, आय और निवास प्रमाण पत्र निर्धारित समय-सीमा के भीतर उपलब्ध कराने हेतु डिजिटल प्रौद्योगिकी को अनिवार्य कर दिया गया है।

मुख्य आदेश एवं दिशा-निर्देश:
१. सभी नागरिक आवेदन अनिवार्य रूप से सेवा सिंधु पोर्टल के माध्यम से ही प्राप्त किए जाएं तथा पावती पर्ची आवेदक के मोबाइल नंबर पर एसएमएस द्वारा भेजी जाए।
२. किसी भी आवेदन को बिना उचित कारण के १५ दिनों से अधिक लंबित नहीं रखा जाएगा। किसी भी प्रकार के विलंब के लिए संबंधित सक्षम प्राधिकारी सीधे उत्तरदायी होंगे।
३. पात्र लाभार्थियों को केवल ₹२५ का निर्धारित शुल्क लेकर डिजिटल हस्ताक्षरित ई-प्रमाण पत्र वितरित किए जाएं।
४. यदि आवेदन अस्वीकृत होता है, तो उसका स्पष्ट कारण दर्ज करते हुए लिखित आदेश पोर्टल पर अपलोड किया जाए।

अंतिम तिथि: ३०-११-२०२६ तक सभी लंबित फाइलों का निपटारा किया जाना अनिवार्य है।
हेल्पलाइन: १८००-४२५-८६६६ | ईमेल: support-edistrict@karnataka.gov.in

विशेष कार्य अधिकारी एवं सरकार के अपर सचिव
कार्मिक एवं प्रशासनिक सुधार विभाग, बेंगलुरु`,
          keyVocabulary: [
            { kannada: 'ಸುತ್ತೋಲೆ', translation: 'परिपत्रक', meaningInEnglish: 'Circular' },
            { kannada: 'ವಿಲೇವಾರಿ', translation: 'निपटारा', meaningInEnglish: 'Disposal' },
            { kannada: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ', translation: 'सक्षम प्राधिकारी', meaningInEnglish: 'Competent Authority' },
          ],
          creationDate: new Date().toISOString(),
        },
        Punjabi: {
          id: 'trans-pa-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Punjabi',
          translatedText: `ਕਰਨਾਟਕ ਸਰਕਾਰ
ਕਰਮਚਾਰੀ ਅਤੇ ਪ੍ਰਸ਼ਾਸਨਿਕ ਸੁਧਾਰ ਵਿਭਾਗ
ਨੰਬਰ: ਡੀਪੀਏਆਰ 48 ਐਸਆਰ 2026, ਵਿਧਾਨ ਸੌਧ, ਬੇਂਗਲੁਰੂ, ਮਿਤੀ: 15-10-2026

ਵਿਸ਼ਾ: ਰਾਜ ਭਰ ਵਿੱਚ ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ ਦਾ ਡਿਜੀਟਾਈਜ਼ੇਸ਼ਨ ਅਤੇ ਅਰਜ਼ੀਆਂ ਦੇ ਨਿਪਟਾਰੇ ਲਈ ਸਮਾਂ ਸੀਮਾ ਨਿਰਧਾਰਤ ਕਰਨ ਸੰਬੰਧੀ।

ਹਵਾਲਾ: ਸਰਕਾਰੀ ਹੁਕਮ ਨੰਬਰ ਡੀਪੀਏਆਰ/22/ਈ-ਗਵਰਨੈਂਸ/2025, ਮਿਤੀ: 01-08-2025।

ਮੁੱਖ ਨਿਰਦੇਸ਼ ਅਤੇ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼:
1. ਸਾਰੀਆਂ ਨਾਗਰਿਕ ਅਰਜ਼ੀਆਂ ਲਾਜ਼ਮੀ ਤੌਰ 'ਤੇ ਸੇਵਾ ਸਿੰਧੂ ਪੋਰਟਲ ਰਾਹੀਂ ਪ੍ਰਾਪਤ ਕੀਤੀਆਂ ਜਾਣ ਅਤੇ ਰਸੀਦ ਬਿਨੈਕਾਰ ਦੇ ਮੋਬਾਈਲ 'ਤੇ ਐਸਐਮਐਸ ਰਾਹੀਂ ਭੇਜੀ ਜਾਵੇ।
2. ਕੋਈ ਵੀ ਅਰਜ਼ੀ ਬਿਨਾਂ ਵਾਜਬ ਕਾਰਨ 15 ਦਿਨਾਂ ਤੋਂ ਵੱਧ ਸਮੇਂ ਲਈ ਲੰਬਿਤ ਨਹੀਂ ਰੱਖੀ ਜਾਵੇਗੀ। ਦੇਰੀ ਲਈ ਸੰਬੰਧਿਤ ਸਮਰੱਥ ਅਧਿਕਾਰੀ ਸਿੱਧੇ ਤੌਰ 'ਤੇ ਜ਼ਿੰਮੇਵਾਰ ਹੋਣਗੇ।
3. ਯੋਗ ਲਾਭਪਾਤਰੀਆਂ ਨੂੰ ਨਿਰਧਾਰਤ ਫੀਸ ₹25 ਲੈ ਕੇ ਡਿਜੀਟਲ ਦਸਤਖਤ ਵਾਲੇ ਈ-ਸਰਟੀਫਿਕੇਟ ਜਾਰੀ ਕੀਤੇ ਜਾਣ।
4. ਅਰਜ਼ੀ ਰੱਦ ਹੋਣ ਦੀ ਸੂਰਤ ਵਿੱਚ ਲਿਖਤੀ ਹੁਕਮ ਪੋਰਟਲ 'ਤੇ ਅਪਲੋਡ ਕੀਤਾ ਜਾਵੇ।

ਆਖਰੀ ਮਿਤੀ: 30-11-2026 ਤੱਕ ਸਾਰੀਆਂ ਲੰਬਿਤ ਫਾਈਲਾਂ ਦਾ ਨਿਪਟਾਰਾ ਕੀਤਾ ਜਾਵੇ।
ਹੈਲਪਲਾਈਨ: 1800-425-8666 | ਈਮੇਲ: support-edistrict@karnataka.gov.in`,
          creationDate: new Date().toISOString(),
        },
        Gujarati: {
          id: 'trans-gu-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Gujarati',
          translatedText: `કર્ણાટક સરકાર
કર્મચારી અને વહીવટી સુધારણા વિભાગ
નંબર: ડીપીએઆર ૪૮ એસઆર ૨૦૨૬, વિધાન સૌધ, બેંગલુરુ, તારીખ: ૧૫-૧૦-૨૦૨૬

વિષય: સમગ્ર રાજ્યમાં નાગરિક સેવાઓનું ડિજિટલાઇઝેશન અને અરજીઓના નિકાલ માટે સમયમર્યાદા નક્કી કરવા બાબત.

મુખ્ય નિર્દેશો અને માર્ગદર્શિકા:
૧. તમામ નાગરિક અરજીઓ ફરજિયાતપણે સેવા સિંધુ પોર્ટલ દ્વારા જ સ્વીકારવી અને પહોંચ સ્લિપ અરજદારના મોબાઇલ નંબર પર એસએમએસ દ્વારા મોકલવી.
૨. કોઈપણ અરજી માન્ય કારણ વગર ૧૫ દિવસથી વધુ સમય માટે પેન્ડિંગ રાખી શકાશે નહીં. વિલંબ માટે સંબંધિત સક્ષમ સત્તાધિકારી સીધા જવાબદાર રહેશે.
૩. પાત્ર લાભાર્થીઓને માત્ર ₹૨૫ ની નિયત ફી વસૂલ કરીને ડિજિટલ સહી ધરાવતા ઈ-પ્રમાણપત્રો આપવા.
૪. જો અરજી નકારવામાં આવે તો તેનું સ્પષ્ટ કારણ દર્શાવીને લેખિત હુકમ પોર્ટલ પર અપલોડ કરવો.

અંતિમ તારીખ: ૩૦-૧૧-૨૦૨૬ સુધીમાં તમામ પેન્ડિંગ ફાઇલોનો નિકાલ કરવો.
હેલ્પલાઇન: ૧૮૦૦-૪૨૫-૮૬૬૬ | ઇમેઇલ: support-edistrict@karnataka.gov.in`,
          creationDate: new Date().toISOString(),
        },
        Telugu: {
          id: 'trans-te-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Telugu',
          translatedText: `కర్ణాటక ప్రభుత్వం
సిబ్బంది మరియు పరిపాలనా సంస్కరణల శాఖ
సంఖ్య: డిపిఎఆర్ 48 ఎస్ఆర్ 2026, విధాన సౌధ, బెంగళూరు, తేదీ: 15-10-2026

విషయం: రాష్ట్రవ్యాప్తంగా పౌర సేవల డిజిటలైజేషన్ మరియు దరఖాస్తుల పరిష్కార కాలపరిమితి నిర్ణయం గురించి.

సందర్భం: ప్రభుత్వ ఉత్తర్వు సంఖ్య డిపిఎఆర్/22/ఇ-పాలన/2025, తేదీ: 01-08-2025.

ముఖ్య ఆదేశాలు మరియు మార్గదర్శకాలు:
1. అన్ని పౌర దరఖాస్తులను తప్పనిసరిగా సేవా సింధు పోర్టల్ ద్వారానే స్వీకరించాలి మరియు రసీదు స్లిప్‌ను దరఖాస్తుదారుడి మొబైల్‌కు ఎస్ఎంఎస్ ద్వారా పంపాలి.
2. ఎటువంటి దరఖాస్తును తగిన కారణం లేకుండా 15 రోజుల కంటే ఎక్కువ పెండింగ్‌లో ఉంచకూడదు. ఆలస్యానికి సంబంధిత సక్షమ ప్రాధికారే నేరుగా బాధ్యత వహిస్తారు.
3. అర్హులైన లబ్ధిదారులకు కేవలం ₹25 రుసుము మాత్రమే వసూలు చేసి డిజిటల్ సంతకం కలిగిన ఈ-ధృవపత్రాలను జారీ చేయాలి.
4. దరఖాస్తు తిరస్కరించబడితే కారణాన్ని స్పష్టంగా పేర్కొంటూ లిఖితపూర్వక ఉత్తర్వును పోర్టల్‌లో అప్‌లోడ్ చేయాలి.

చివరి గడువు: 30-11-2026 లోపు అన్ని పెండింగ్ ఫైళ్లను పరిష్కరించాలి.
హెల్ప్‌లైన్: 1800-425-8666 | ఈమెయిల్: support-edistrict@karnataka.gov.in`,
          creationDate: new Date().toISOString(),
        },
        Tamil: {
          id: 'trans-ta-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Tamil',
          translatedText: `கர்நாடக அரசு
பணியாளர் மற்றும் நிர்வாக சீர்திருத்தத் துறை
எண்: டிபிஏஆர் 48 எஸ்ஆர் 2026, விதான சவுதா, பெங்களூரு, நாள்: 15-10-2026

பொருள்: மாநிலம் முழுவதும் குடிமக்கள் சேவைகளை டிஜிட்டல் மயமாக்குதல் மற்றும் விண்ணப்பங்களை தீர்ப்பதற்கான காலக்கெடுவை நிர்ணயித்தல் குறித்து.

முக்கிய வழிகாட்டுதல்கள்:
1. அனைத்து குடிமக்கள் விண்ணப்பங்களும் கட்டாயமாக சேவா சிந்து போர்டல் வழியாகவே பெறப்பட்டு, ஒப்புகை சீட்டு விண்ணப்பதாரரின் கைபேசிக்கு எஸ்எம்எஸ் மூலம் அனுப்பப்பட வேண்டும்.
2. எந்தவொரு விண்ணப்பத்தையும் காரணமின்றி 15 நாட்களுக்கு மேல் நிலுவையில் வைக்கக்கூடாது. தாமதத்திற்கு தகுதியான அதிகாரியே நேரடியாக பொறுப்பாவார்.
3. தகுதியான பயனாளிகளுக்கு நிர்ணயிக்கப்பட்ட கட்டணமான ₹25 மட்டுமே பெற்று டிஜிட்டல் கையொப்பமிட்ட மின்-சான்றிதழ்களை வழங்க வேண்டும்.
4. விண்ணப்பம் நிராகரிக்கப்பட்டால் தெளிவான காரணத்தைக் குறிப்பிட்டு எழுத்துப்பூர்வ ஆணையை போர்ட்டலில் பதிவேற்ற வேண்டும்.

கடைசி நாள்: 30-11-2026க்குள் நிலுவையில் உள்ள அனைத்து கோப்புகளும் தீர்க்கப்பட வேண்டும்.
உதவி எண்: 1800-425-8666 | மின்னஞ்சல்: support-edistrict@karnataka.gov.in`,
          creationDate: new Date().toISOString(),
        },
        Malayalam: {
          id: 'trans-ml-1',
          documentId: 'doc-gov-circ-001',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Malayalam',
          translatedText: `കർണാടക സർക്കാർ
പേഴ്സണൽ ആൻഡ് അഡ്മിനിസ്ട്രേറ്റീവ് റിഫോംസ് വകുപ്പ്
നമ്പർ: ഡിപിഎആർ 48 എസ്ആർ 2026, വിധാൻ സൗധ, ബെംഗളൂരു, തീയതി: 15-10-2026

വിഷയം: സംസ്ഥാനത്തുടനീളം പൗര സേവനങ്ങളുടെ ഡിജിറ്റലൈസേഷനും അപേക്ഷാ തീർപ്പാക്കൽ സമയപരിധി നിശ്ചയിക്കലും സംബന്ധിച്ച്.

പ്രധാന നിർദ്ദേശങ്ങൾ:
1. എല്ലാ പൗര അപേക്ഷകളും സേവാ സിന്ധു പോർട്ടൽ വഴി മാത്രം സ്വീകരിക്കുകയും കൈപ്പറ്റ് രസീത് അപേക്ഷകന്റെ മൊബൈൽ നമ്പറിലേക്ക് എസ്എംഎസ് വഴി അയക്കുകയും വേണം.
2. ഒരു അപേക്ഷയും സാധുവായ കാരണമില്ലാതെ 15 ദിവസത്തിൽ കൂടുതൽ തീർപ്പുകൽപ്പിക്കാതെ വെക്കാൻ പാടില്ല. കാലതാമസത്തിന് ബന്ധപ്പെട്ട അധികാരപ്പെട്ട ഉദ്യോഗസ്ഥൻ നേരിട്ട് ഉത്തരവാദിയായിരിക്കും.
3. അർഹരായ ഗുണഭോക്താക്കൾക്ക് നിശ്ചിത ഫീസായ ₹25 മാത്രം ഈടാക്കി ഡിജിറ്റൽ ഒപ്പുള്ള ഇ-സർട്ടിഫിക്കറ്റുകൾ വിതരണം ചെയ്യണം.
4. അപേക്ഷ നിരസിക്കുകയാണെങ്കിൽ കൃത്യമായ കാരണം വ്യക്തമാക്കി രേഖാമൂലമുള്ള ഉത്തരവ് പോർട്ടലിൽ അപ്‌ലോഡ് ചെയ്യണം.

അവസാന തീയതി: 30-11-2026-നകം എല്ലാ ബാക്കി ഫയലുകളും തീർപ്പാക്കേണ്ടതാണ്.
ഹെൽപ്പ്‌ലൈൻ: 1800-425-8666 | ഇമെയിൽ: support-edistrict@karnataka.gov.in`,
          creationDate: new Date().toISOString(),
        },
      },
      summaries: {
        standard: {
          id: 'sum-std-1',
          documentId: 'doc-gov-circ-001',
          summaryType: 'standard',
          mainSubject: 'Mandatory digitization of Karnataka citizen services on Seva Sindhu with a 15-day strict disposal limit.',
          mainSubjectKannada: 'ಸೇವಾಸಿಂಧು ಮೂಲಕ ನಾಗರಿಕ ಸೇವೆಗಳ ಕಡ್ಡಾಯ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ೧೫ ದಿನಗಳ ವಿಲೇವಾರಿ ಗಡುವು.',
          shortSummary: 'The Karnataka Government mandates that all citizen certificates (caste, income, revenue) be processed via the Seva Sindhu portal within 15 days at a fixed fee of ₹25. All pending files must be cleared by November 30, 2026.',
          detailedSummary: 'This official circular from the Department of Personnel and Administrative Reforms (DPAR), Government of Karnataka, establishes strict citizen service timelines. Applications must receive SMS acknowledgements via Seva Sindhu. Applications cannot linger beyond 15 days without direct administrative liability. Prescribed fee is strictly capped at ₹25 with digital signature certificates.',
          importantPoints: [
            'Compulsory routing through Seva Sindhu with mobile SMS acknowledgement slips.',
            'Strict 15-day maximum disposal timeframe for revenue, caste, and income certificates.',
            'Prescribed fee is capped at ₹25 for digitally signed e-certificates.',
            'Rejections require a formal written reason uploaded directly to the citizen portal.',
          ],
          keyInstructions: [
            'Never accept offline citizen applications outside Seva Sindhu.',
            'Ensure SMS delivery of acknowledgement numbers to applicants.',
            'Clear all existing backlogs before November 30, 2026.',
          ],
          importantDates: [
            { date: '15-10-2026', significance: 'Circular issuance date' },
            { date: '01-08-2025', significance: 'Reference Government Order date' },
            { date: '30-11-2026', significance: 'Final mandatory deadline for all pending file disposal' },
          ],
          mainConclusions: 'Civil servants are directly accountable for certificate delays, ensuring fast, transparent, and corruption-free delivery of essential documents to citizens across Karnataka.',
          simpleLanguageExplanation: 'If you apply for a caste, income, or revenue certificate in Karnataka, the government must now process it in 15 days for ₹25 via the Seva Sindhu website, and you will get SMS updates.',
          creationDate: new Date().toISOString(),
        },
      },
      extractedInfo: {
        documentId: 'doc-gov-circ-001',
        personNames: [],
        organizationNames: [
          { name: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ (Government of Karnataka)', sourceSnippet: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ' },
          { name: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ (DPAR)', sourceSnippet: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ' },
          { name: 'ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ (Seva Sindhu Portal)', sourceSnippet: 'ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸಿ' },
        ],
        addresses: [
          { address: 'ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು (Vidhana Soudha, Bengaluru)', sourceSnippet: 'ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು' },
        ],
        locations: [
          { location: 'ಬೆಂಗಳೂರು (Bengaluru)', sourceSnippet: 'ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು' },
          { location: 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳು', sourceSnippet: 'ಎಲ್ಲಾ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳಲ್ಲಿ' },
        ],
        dates: [
          { date: '೧೫-೧೦-೨೦೨೬ (15-10-2026)', context: 'Circular issue date', sourceSnippet: 'ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬' },
          { date: '೦೧-೦೮-೨೦೨೫ (01-08-2025)', context: 'Reference order date', sourceSnippet: 'ದಿನಾಂಕ: ೦೧-೦೮-೨೦೨೫' },
        ],
        deadlines: [
          { deadline: '೩೦-೧೧-೨೦೨೬ (30 November 2026)', description: 'Mandatory disposal deadline for all pending files', sourceSnippet: '೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ವಿಲೇವಾರಿ ಮಾಡತಕ್ಕದ್ದು' },
          { deadline: '೧೫ ದಿನಗಳು (15 Days)', description: 'Individual application disposal limit', sourceSnippet: '೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ' },
        ],
        phoneNumbers: [
          { number: '೧೮೦೦-೪೨೫-೮೬೬೬ (1800-425-8666)', sourceSnippet: 'ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬' },
        ],
        emailAddresses: [
          { email: 'support-edistrict@karnataka.gov.in', sourceSnippet: 'support-edistrict@karnataka.gov.in' },
        ],
        monetaryAmounts: [
          { amount: '₹೨೫ (₹25)', purpose: 'Prescribed fee for digital e-certificates', sourceSnippet: 'ನಿಗದಿತ ಶುಲ್ಕ ₹೨೫ ಮಾತ್ರ ಪಡೆದು' },
        ],
        importantInstructions: [
          { instruction: 'All applications must be received through Seva Sindhu portal only', sourceSnippet: 'ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸಿ' },
          { instruction: 'Acknowledge via SMS with tracking number to citizen mobile phone', sourceSnippet: 'ಸ್ವೀಕೃತಿ ರಸೀದಿಯನ್ನು ಅರ್ಜಿದಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಎಸ್‌ಎಂಎಸ್ ಮೂಲಕ ರವಾನಿಸತಕ್ಕದ್ದು' },
        ],
        documentReferences: [
          { reference: 'ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬ (DPAR 48 SR 2026)', sourceSnippet: 'ಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬' },
          { reference: 'ಡಿಪಿಎಆರ್/೨೨/ಇ-ಆಡಳಿತ/೨೦೨೫', sourceSnippet: 'ಡಿಪಿಎಆರ್/೨೨/ಇ-ಆಡಳಿತ/೨೦೨೫' },
        ],
        creationDate: new Date().toISOString(),
      },
      simplification: {
        documentId: 'doc-gov-circ-001',
        simplifiedKannada: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರವು ಎಲ್ಲಾ ನಾಗರಿಕರ ಜಾತಿ, ಆದಾಯ ಹಾಗೂ ಕಂದಾಯ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಸೇವಾಸಿಂಧು ವೆಬ್‌ಸೈಟ್ ಮೂಲಕವೇ ನೀಡಲು ಆದೇಶಿಸಿದೆ. ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ನಂತರ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಎಸ್‌ಎಂಎಸ್ ಬರುತ್ತದೆ. ೧೫ ದಿನಗಳೊಳಗೆ ಕೇವಲ ₹೨೫ ಶುಲ್ಕದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಮಾಣಪತ್ರ ನೀಡಬೇಕು. ಯಾವುದೇ ವಿಳಂಬವಾದರೆ ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಗಳೇ ಜವಾಬ್ದಾರರು.',
        easyEnglish: 'The Karnataka Government now requires all caste, income, and revenue certificates to be applied for online via the Seva Sindhu website. You will receive an SMS acknowledgement on your phone. Officers must approve or reject your application within 15 days, and the official fee is just ₹25.',
        hindiExplanation: 'कर्नाटक सरकार ने आदेश दिया है कि जाति, आय और निवास प्रमाण पत्र अब केवल सेवा सिंधु पोर्टल के माध्यम से 15 दिनों के भीतर दिए जाएं। इसका आधिकारिक शुल्क ₹25 है और आवेदक को मोबाइल पर एसएमएस मिलेगा।',
        difficultWordsGlossary: [
          {
            word: 'ಸುತ್ತೋಲೆ',
            simpleMeaningKannada: 'ಸರ್ಕಾರದ ಅಧಿಕೃತ ಆದೇಶದ ಪತ್ರ',
            englishMeaning: 'Official government circular or directive',
            usageContext: 'Used for administrative instructions across districts',
          },
          {
            word: 'ವಿಲೇವಾರಿ',
            simpleMeaningKannada: 'ಅರ್ಜಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ ಪರಿಹರಿಸುವುದು',
            englishMeaning: 'Final processing, settlement, or disposal of a case',
            usageContext: 'Refers to clearing pending citizen files',
          },
          {
            word: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ',
            simpleMeaningKannada: 'ಆದೇಶ ನೀಡಲು ಅಧಿಕಾರ ಹೊಂದಿರುವ ಅಧಿಕಾರಿ',
            englishMeaning: 'Competent Authority legally empowered to issue decisions',
            usageContext: 'Refers to the Tahsildar or designated administrative officer',
          },
          {
            word: 'ಸ್ವೀಕೃತಿ ರಸೀದಿ',
            simpleMeaningKannada: 'ಅರ್ಜಿ ತಲುಪಿದೆ ಎಂದು ನೀಡುವ ಪಾವತಿ ರಶೀದಿ',
            englishMeaning: 'Official acknowledgement receipt slip',
            usageContext: 'Sent via SMS to the citizen mobile phone',
          },
        ],
        paragraphComparison: [
          {
            originalSnippet: 'ಯಾವುದೇ ಅರ್ಜಿಯನ್ನು ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ.',
            simplifiedSnippet: 'ಯಾವುದೇ ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಕ್ಕಿಂತ ಹೆಚ್ಚು ತಡಮಾಡುವಂತಿಲ್ಲ.',
          },
          {
            originalSnippet: 'ಅರ್ಹ ಫಲಾನುಭವಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿರುವ ಇ-ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನಿಗದಿತ ಶುಲ್ಕ ₹೨೫ ಮಾತ್ರ ಪಡೆದು ವಿತರಿಸಬೇಕು.',
            simplifiedSnippet: 'ಕೇವಲ ₹೨೫ ರೂಪಾಯಿ ಪಡೆದು ಡಿಜಿಟಲ್ ಸಹಿ ಇರುವ ಪ್ರಮಾಣಪತ್ರ ನೀಡಬೇಕು.',
          },
        ],
        creationDate: new Date().toISOString(),
      },
      chatHistory: [
        {
          id: 'msg-1',
          role: 'user',
          text: 'What is the maximum deadline for processing applications according to this circular?',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          text: 'According to this circular, the individual application disposal time limit is strictly 15 days (೧೫ ದಿನಗಳು), and all backlog files must be cleared by November 30, 2026 (೩೦-೧೧-೨೦೨೬).',
          textKannada: 'ಈ ಸುತ್ತೋಲೆಯ ಪ್ರಕಾರ, ಯಾವುದೇ ನಾಗರಿಕ ಅರ್ಜಿಯನ್ನು ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ ಹಾಗೂ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಕಡ್ಡಾಯವಾಗಿ ವಿಲೇವಾರಿ ಮಾಡಬೇಕು.',
          isFoundInDocument: true,
          confidence: 'high',
          sourceReferences: [
            {
              sourceSnippet: 'ಯಾವುದೇ ಅರ್ಜಿಯನ್ನು ಕಾರಣವಿಲ್ಲದೆ ೧೫ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಬಾಕಿ ಉಳಿಸಿಕೊಳ್ಳುವಂತಿಲ್ಲ.',
              relevance: 'States the maximum 15-day application disposal period.',
              pageEstimate: 1,
            },
            {
              sourceSnippet: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ: ೩೦-೧೧-೨೦೨೬ ರೊಳಗೆ ಎಲ್ಲಾ ಬಾಕಿ ಕಡತಗಳನ್ನು ವಿಲೇವಾರಿ ಮಾಡತಕ್ಕದ್ದು.',
              relevance: 'Final backlog clearance deadline.',
              pageEstimate: 1,
            },
          ],
          suggestedFollowUps: [
            'What is the prescribed fee for issuing certificates?',
            'Which portal must be used for receiving citizen applications?',
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'doc-hist-ins-002',
      filename: 'Hampi_Virupaksha_Inscription_1522.jpg',
      fileType: 'image/jpeg',
      uploadDate: new Date(Date.now() - 3600000 * 5).toISOString(),
      fileSizeFormatted: '2.1 MB',
      pageCount: 1,
      documentCategory: 'Historical Document',
      processingStatus: 'ready',
      isFavourite: false,
      currentPageIndex: 0,
      pages: [
        {
          pageNumber: 1,
          originalImage: doc2Image,
          ocrResult: {
            extractedText: doc2ExtractedText,
            correctedText: doc2ExtractedText,
            detectedLanguage: 'Kannada (Old Kannada style)',
            wordCount: 114,
            estimatedConfidence: 89,
            paragraphs: [
              {
                id: 'p1',
                text: 'ಕನ್ನಡ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ\nಸಂಪುಟ: ೧೪, ಕ್ರಿ.ಶ. ೧೫೨೨ ರ ಕೃಷ್ಣದೇವರಾಯರ ಕಾಲದ ಹಂಪಿಯ ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ ಶಾಸನ',
                type: 'heading',
                boundingBox: [60, 60, 160, 940],
              },
              {
                id: 'p2',
                text: 'ವಿಷಯ: ಹಂಪಿಯ ರಾಯಗೋಪುರ ನಿರ್ಮಾಣ ಮತ್ತು ಧರ್ಮದಾನ ವಿವರಣೆ ಕುರಿತ ಶಿಲಾಶಾಸನ.\nಲಿಪಿ ಸ್ವರೂಪ: ಪ್ರಾಚೀನ ಮಧ್ಯಕಾಲೀನ ಕನ್ನಡ ಲಿಪಿ ಮತ್ತು ಸಾಹಿತ್ಯಕ ಶೈಲಿ (ಹಳಗನ್ನಡ ಛಾಯೆ).',
                type: 'body',
                boundingBox: [180, 60, 260, 940],
              },
              {
                id: 'p3',
                text: 'ಪ್ರಸ್ತಾವನೆ: ಶ್ರೀಮನ್ ಮಹಾರಾಜಾಧಿರಾಜ ರಾಜಪರಮೇಶ್ವರ ವೀರಪ್ರತಾಪ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ ರಾಜ್ಯಭಾರ ಮಾಡುತ್ತಿದ್ದ ಕಾಲದಲ್ಲಿ ಈ ಧರ್ಮಶಾಸನವನ್ನು ಬರೆಯಲಾಯಿತು.',
                type: 'body',
                boundingBox: [280, 60, 380, 940],
              },
              {
                id: 'p4',
                text: 'ಶಾಸನದ ಮುಖ್ಯ ಸಾರಾಂಶ:\nಸ್ವಸ್ತಿ ಶ್ರೀ ವಿಜಯಾಭ್ಯುದಯ ಶಾಲಿವಾಹನ ಶಕವರ್ಷ ೧೪೪೪ ನೇ ವಿಕ್ರಮ ಸಂವತ್ಸರದ ವೈಶಾಖ ಶುದ್ಧ ಪೌರ್ಣಮಿ ಪುಣ್ಯಕಾಲದಲ್ಲಿ ಮಹಾರಾಯರು ಪಂಪಾಪತಿ ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿ ಸಮರ್ಪಿಸಿದರು.\nದೇವಾಲಯದ ನಿತ್ಯ ನೈವೇದ್ಯ ಮತ್ತು ನಂದಾದೀಪ ಸೇವೆಗಾಗಿ ತುಂಗಭದ್ರಾ ನದಿಯ ತೀರದ ಮೂರು ಫಲವತ್ತಾದ ಕೃಷಿ ಗ್ರಾಮಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಸರ್ವಮಾನ್ಯ ದಾನವಾಗಿ ನೀಡಲಾಗಿದೆ.',
                type: 'body',
                boundingBox: [400, 60, 680, 940],
              },
              {
                id: 'p5',
                text: 'ಈ ದಾನವನ್ನು ಯಾರಾದರೂ ಅಪಹರಿಸಿದರೆ ಅಥವಾ ಅಡ್ಡಿಪಡಿಸಿದರೆ ಅವರು ಗಂಗಾತೀರದಲ್ಲಿ ಗೋಹತ್ಯೆ ಮಾಡಿದ ಮಹಾಪಾಪಕ್ಕೆ ಗುರಿಯಾಗುವರೆಂದು ಶಾಸನೋಕ್ತ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.\nಸ್ಥಳ: ಹಂಪಿ, ಬಳ್ಳಾರಿ ಜಿಲ್ಲೆ (ಪ್ರಸ್ತುತ ವಿಜಯನಗರ ಜಿಲ್ಲೆ), ಕರ್ನಾಟಕ ರಾಜ್ಯ.',
                type: 'footer',
                boundingBox: [700, 60, 850, 940],
              },
            ],
            uncertainWords: [
              {
                word: 'ಶಾಲಿವಾಹನ',
                suggestedAlternatives: ['ಶಾಲಿವಾಹನ', 'ಸಾಲಿವಾಹನ'],
                confidenceLevel: 'medium',
                reason: 'Archaic epigraphical ligature for Shaka era date',
              },
            ],
          },
        },
      ],
      recoveryAssessment: {
        qualityScore: 74,
        overallCondition: 'Degraded',
        blurLevel: 'Mild',
        contrastQuality: 'Faded',
        skewAngleEstimateDegrees: -1.2,
        lightingUniformity: 'Mild Shadows',
        detectedIssues: [
          {
            issue: 'Faded text contrast from ancient stone engraving simulation',
            severity: 'medium',
            description: 'The background has grain variations and reduced contrast between glyph lines and paper.',
          },
          {
            issue: 'Slight counter-clockwise skew (-1.2°)',
            severity: 'low',
            description: 'Document has a subtle angle that benefits from automatic deskew alignment.',
          },
        ],
        recommendedEnhancements: [
          {
            operation: 'contrast',
            suggestedValue: 30,
            reason: 'Dramatically improves separation of stone-engraved Kannada character strokes.',
          },
          {
            operation: 'deskew',
            suggestedValue: 1.2,
            reason: 'Straightens text baseline for improved OCR bounding line accuracy.',
          },
        ],
      },
      translations: {
        English: {
          id: 'trans-hampi-en',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'English',
          translatedText: `KANNADA RESEARCH INSTITUTE
Volume: 14, Hampi Virupaksha Temple Stone Inscription from the Reign of Krishnadevaraya (1522 CE)

Subject: Stone epigraph detailing the construction of the Raya Gopura at Hampi and the religious endowment.
Script Style: Ancient-Medieval Kannada script and formal literary diction (Halegannada influence).

Preamble:
This religious inscription was written during the reign of the King of Kings, Supreme Lord, Hero of Valor, Sri Krishnadevaraya Maharaya, ruling from the imperial capital of Vijayanagara.

Main Inscription Summary:
Hail! In the victorious and prosperous Salivahana Shaka year 1444, during the holy occasion of Vaishakha Shuddha Poornima in the Vikrama samvatsara, the Emperor constructed and dedicated the monumental Raya Gopura to Lord Pampakhetra Virupaksha.
For the eternal daily offerings (Naivedya) and the perpetual holy lamp (Nandadipa) services of the temple, three fertile agricultural villages situated along the banks of the Tungabhadra River were granted in perpetuity as tax-exempt endowments (Sarvamanya Dana).
An epigraphical admonition states that anyone who encroaches upon or obstructs this holy grant shall incur the grave sin of slaying a sacred cow on the banks of the Holy Ganges.

Location: Hampi, Bellary District (present-day Vijayanagara District), Karnataka State.`,
          keyVocabulary: [
            { kannada: 'ರಾಯಗೋಪುರ', translation: 'Raya Gopura', meaningInEnglish: 'Grand temple entrance tower built by Vijayanagara kings' },
            { kannada: 'ಶಾಲಿವಾಹನ ಶಕವರ್ಷ', translation: 'Salivahana Shaka Era', meaningInEnglish: 'Traditional Indian solar calendar era starting 78 CE' },
            { kannada: 'ಸರ್ವಮಾನ್ಯ ದಾನ', translation: 'Sarvamanya Dana', meaningInEnglish: 'Perpetual tax-free royal land endowment' },
            { kannada: 'ನಂದಾದೀಪ', translation: 'Nandadipa', meaningInEnglish: 'Perpetual lamp kept lit in a Hindu temple sanctum' },
          ],
          creationDate: new Date().toISOString(),
        },
        Hindi: {
          id: 'trans-hampi-hi',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Hindi',
          translatedText: `कन्नड़ अनुसंधान संस्थान
खंड: १४, कृष्णदेवराय के काल का हम्पी विरुपाक्ष मंदिर शिलालेख (१५२२ ईस्वी)

विषय: हम्पी के रायगोपुरम निर्माण और धर्मदान विवरण संबंधी शिलालेख।
लिपि शैली: प्राचीन मध्यकालीन कन्नड़ लिपि और साहित्यिक शैली (हलैगन्नड़ प्रभाव)।

प्रस्तावना:
महाराजाधिराज राजपरमेश्वर वीरप्रताप श्रीकृष्णदेवराय महाराय के विजयनगर की राजधानी में शासनकाल के दौरान यह धर्म-शिलालेख उत्कीर्ण किया गया था।

शिलालेख का मुख्य सार:
शुभ हो! शालीवाहन शक संवत १४४४ के विक्रम संवत्सर में वैशाख शुक्ल पूर्णिमा के पावन अवसर पर सम्राट ने भगवान पंपापति विरुपाक्ष को भव्य रायगोपुरम समर्पित किया।
मंदिर के दैनिक नैवेद्य और अखंड नंदादीप सेवा हेतु तुंगभद्रा नदी के तट पर स्थित तीन उपजाऊ कृषि गांवों को सदा के लिए कर-मुक्त सर्वमान्य दान के रूप में प्रदान किया गया।
इस दान को नष्ट करने वाले पर गंगा तट पर गोहत्या का महापाप लगने की चेतावनी दी गई है।

स्थान: हम्पी, बेल्लारी जिला (वर्तमान विजयनगर जिला), कर्नाटक राज्य।`,
          creationDate: new Date().toISOString(),
        },
        Marathi: {
          id: 'trans-hampi-mr',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Marathi',
          translatedText: `कन्नड संशोधन संस्था
खंड: १४, इसवी सन १५२२ च्या कृष्णदेवरायांच्या काळातील हम्पी येथील विरुपाक्ष मंदिर शिलालेख

विषय: हम्पी येथील रायगोपूर निर्मिती आणि धर्मदान वर्णनाचा शिलालेख.
लिपी: प्राचीन मध्ययुगीन कन्नड लिपी आणि साहित्यिक शैली.

प्रस्तावना:
महाराजाधिराज राजपरमेश्वर वीरप्रताप श्रीकृष्णदेवराय विजयनगरच्या राजधानीत राज्य करत असताना हा धर्मशिलालेख कोरला गेला.

शिलालेखाचा मुख्य सारांश:
शालीवाहन शक १४४४ मध्ये वैशाख शुद्ध पौर्णिमेच्या शुभमुहूर्तावर पंपापती विरुपाक्ष देवाला भव्य रायगोपूर बांधून अर्पण करण्यात आले.
मंदिराच्या नित्य नैवेद्य आणि नंदादीप सेवेसाठी तुंगभद्रा नदीकाठची तीन सुपीक शेती गावे कायमस्वरूपी करमुक्त दान म्हणून देण्यात आली.

स्थान: हम्पी, विजयनगर जिल्हा, कर्नाटक राज्य.`,
          creationDate: new Date().toISOString(),
        },
        Telugu: {
          id: 'trans-hampi-te',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Telugu',
          translatedText: `కన్నడ పరిశోధనా సంస్థ
సంపుటం: 14, క్రీ.శ. 1522 శ్రీకృష్ణదేవరాయల కాలం నాటి హంపి విరూపాక్ష దేవాలయ శాసనం

విషయం: హంపి రాయగోపురం నిర్మాణం మరియు ధర్మదాన వివరాల శిలాశాసనం.
లిపి శైలి: ప్రాచీన మధ్యయుగ కన్నడ లిపి మరియు సాహిత్య శైలి.

సారాంశం:
విజయనగర సామ్రాజ్యాధినేత శ్రీకృష్ణదేవరాయలు శాలివాహన శకవర్షం 1444 వైశాఖ శుద్ధ పౌర్ణమి పుణ్యకాలంలో పంపాపతి విరూపాక్ష స్వామికి రాయగోపురాన్ని నిర్మించి సమర్పించారు.
స్వామివారి నిత్య నైవేద్యం, నందాదీప సేవలకు తుంగభద్ర నదీ తీరంలోని మూడు సారవంతమైన గ్రామాలను శాశ్వత సర్వమాన్య దానంగా ఇచ్చారు.

స్థలం: హంపి, ప్రస్తుత విజయనగర జిల్లా, కర్ణాటక.`,
          creationDate: new Date().toISOString(),
        },
        Tamil: {
          id: 'trans-hampi-ta',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Tamil',
          translatedText: `கன்னட ஆராய்ச்சி நிறுவனம்
தொகுதி: 14, கி.பி. 1522 கிருஷ்ணதேவராயர் காலத்து ஹம்பி விருபாக்ஷர் கோயில் கல்வெட்டு

பொருள்: ஹம்பி ராயகோபுரம் கட்டியமைத்தல் மற்றும் தர்மதான விளக்கம் குறித்த கல்வெட்டு.

முக்கிய சுருக்கம்:
விஜயநகர மன்னர் ஸ்ரீ கிருஷ்ணதேவராயர் சாலிவாகன சகாப்தம் 1444 வைகாசி பௌர்ணமி நன்னாளில் பம்பாபதி விருபாக்ஷ தேவருக்கு ராயகோபுரத்தை கட்டி அர்ப்பணித்தார்.
கோயிலின் நித்திய நெய்வேத்தியம் மற்றும் நந்தாவிளக்கு பூஜைக்காக துங்கபத்ரா நதிக்கரையில் உள்ள மூன்று வளமான கிராமங்களை நிலதானமாக வழங்கினார்.

இடம்: ஹம்பி, விஜயநகர மாவட்டம், கர்நாடகா.`,
          creationDate: new Date().toISOString(),
        },
        Malayalam: {
          id: 'trans-hampi-ml',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Malayalam',
          translatedText: `കന്നഡ ഗവേഷണ സ്ഥാപനം
വാല്യം: 14, എ.ഡി. 1522-ലെ കൃഷ്ണദേവരായരുടെ കാലത്തെ ഹംപി വിരൂപാക്ഷ ക്ഷേത്ര ശിലാശാസനം

വിഷയം: ഹംപിയിലെ രായഗോപുര നിർമ്മാണവും ധർമ്മദാനവും സംബന്ധിച്ച ശിലാശാസനം.

പ്രധാന സംഗ്രഹം:
വിജയനഗര ചക്രവർത്തി ശ്രീകൃഷ്ണദേവരായർ ശാലിവാഹന ശകവർഷം 1444-ൽ വൈശാഖ പൗർണ്ണമി പുണ്യവേളയിൽ വിരൂപാക്ഷ സ്വാമിക്ക് രായഗോപുരം സമർപ്പിച്ചു.
ക്ഷേത്രത്തിലെ നിത്യ നൈവേദ്യത്തിനും നന്ദാദീപത്തിനുമായി തുങ്ഗഭദ്ര നദീതീരത്തെ മൂന്ന് ഫലഭൂയിഷ്ഠമായ ഗ്രാമങ്ങൾ സർവ്വമാന്യ ദാനമായി നൽകി.

സ്ഥലം: ഹംപി, കർണ്ണാടക.`,
          creationDate: new Date().toISOString(),
        },
        Punjabi: {
          id: 'trans-hampi-pa',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Punjabi',
          translatedText: `ਕੰਨੜ ਖੋਜ ਸੰਸਥਾ
ਜਿਲਦ: 14, ਕ੍ਰਿਸ਼ਨਦੇਵਰਾਏ ਦੇ ਕਾਲ ਦਾ ਹੰਪੀ ਵਿਰੂਪਾਕਸ਼ ਮੰਦਰ ਦਾ ਸ਼ਿਲਾ-ਲੇਖ (1522 ਈ.)

ਵਿਸ਼ਾ: ਹੰਪੀ ਦੇ ਰਾਇਗੋਪੁਰਮ ਨਿਰਮਾਣ ਅਤੇ ਧਰਮ ਦਾਨ ਸੰਬੰਧੀ ਪੱਥਰ ਦਾ ਸ਼ਿਲਾ-ਲੇਖ।

ਸਾਰ:
ਵਿਜੇਨਗਰ ਦੇ ਸਮਰਾਟ ਸ਼੍ਰੀ ਕ੍ਰਿਸ਼ਨਦੇਵਰਾਏ ਨੇ ਸ਼ਾਲੀਵਾਹਨ ਸ਼ਕ 1444 ਵਿੱਚ ਵੈਸਾਖ ਪੂਰਨਮਾਸ਼ੀ ਦੇ ਪਵਿੱਤਰ ਅਵਸਰ 'ਤੇ ਭਗਵਾਨ ਵਿਰੂਪਾਕਸ਼ ਨੂੰ ਸ਼ਾਨਦਾਰ ਰਾਇਗੋਪੁਰਮ ਸਮਰਪਿਤ ਕੀਤਾ।
ਮੰਦਰ ਦੀ ਰੋਜ਼ਾਨਾ ਪੂਜਾ ਅਤੇ ਅਖੰਡ ਦੀਵੇ ਦੀ ਸੇਵਾ ਲਈ ਤੁੰਗਭਦਰਾ ਨਦੀ ਕੰਢੇ ਤਿੰਨ ਉਪਜਾਊ ਪਿੰਡ ਸਦਾ ਲਈ ਦਾਨ ਕੀਤੇ।`,
          creationDate: new Date().toISOString(),
        },
        Gujarati: {
          id: 'trans-hampi-gu',
          documentId: 'doc-hist-ins-002',
          sourceLanguage: 'Kannada',
          targetLanguage: 'Gujarati',
          translatedText: `કન્નડ સંશોધન સંસ્થા
સંપુટ: ૧૪, ઈ.સ. ૧૫૨૨ ના કૃષ્ણદેવરાયના સમયનો હમ્પી વિરૂપાક્ષ મંદિરનો શિલાલેખ

વિષય: હમ્પીના રાયગોપુરમ નિર્માણ અને ધર્મદાન વર્ણન અંગેનો શિલાલેખ.

મુખ્ય સારાંશ:
વિજયનગરના મહારાજા કૃષ્ણદેવરાયે શાલીવાહન શક ૧૪૪૪ માં વૈશાખ પૂર્ણિમાના પવિત્ર અવસરે ભગવાન વિરૂપાક્ષને ભવ્ય રાયગોપુરમ સમર્પિત કર્યું.
મંદિરના નિત્ય નૈવેદ્ય અને નંદાદીપ સેવા માટે તુંગભદ્રા નદી કિનારે ત્રણ ફળદ્રુપ ગામો દાનમાં આપ્યા.`,
          creationDate: new Date().toISOString(),
        },
      },
      summaries: {
        standard: {
          id: 'sum-hampi-std',
          documentId: 'doc-hist-ins-002',
          summaryType: 'standard',
          mainSubject: 'Krishnadevaraya dedication of Hampi Raya Gopura and endowment of 3 Tungabhadra villages (1522 CE).',
          mainSubjectKannada: 'ಕೃಷ್ಣದೇವರಾಯರಿಂದ ಹಂಪಿ ರಾಯಗೋಪುರ ನಿರ್ಮಾಣ ಮತ್ತು ತುಂಗಭದ್ರಾ ತೀರದ ೩ ಗ್ರಾಮಗಳ ದಾನ (ಕ್ರಿ.ಶ. ೧೫೨೨).',
          shortSummary: 'In Shaka 1444 (1522 CE), Vijayanagara Emperor Krishnadevaraya dedicated the famous Raya Gopura at Virupaksha Temple, granting three agricultural villages along the Tungabhadra for temple services.',
          detailedSummary: 'A prime epigraphical record from the golden era of Vijayanagara detailing Krishnadevarayas patronage of Virupaksha Temple at Hampi. It notes the astronomical date (Vaishakha Shuddha Poornima), the architecture dedicated (Raya Gopura), and the perpetuity of the endowment (Sarvamanya Dana).',
          importantPoints: [
            'Issued by Vijayanagara Emperor Sri Krishnadevaraya in 1522 CE (Shaka 1444).',
            'Documents the construction of the celebrated Raya Gopura entrance tower at Hampi.',
            'Granted 3 agricultural villages on the Tungabhadra riverbanks as tax-exempt endowments.',
            'Preserves traditional epigraphical curses protecting temple endowments from violation.',
          ],
          keyInstructions: [
            'Preserve ancient Kannada epigraphical vocabulary for historical analysis.',
            'Maintain historical land boundaries noted along the Tungabhadra river.',
          ],
          importantDates: [
            { date: 'ಕ್ರಿ.ಶ. ೧೫೨೨ (1522 CE)', significance: 'Date of inscription and Gopura dedication' },
            { date: 'ಶಾಲಿವಾಹನ ಶಕ ೧೪೪೪', significance: 'Traditional Shaka astronomical era year' },
          ],
          mainConclusions: 'The inscription confirms the peak architectural flourishing and religious patronage of the Vijayanagara Empire under Krishnadevaraya.',
          simpleLanguageExplanation: 'This stone inscription from 1522 shows how King Krishnadevaraya built the giant entrance gate at Hampi Virupaksha temple and gifted 3 farming villages to pay for temple food and lamps.',
          creationDate: new Date().toISOString(),
        },
      },
      extractedInfo: {
        documentId: 'doc-hist-ins-002',
        personNames: [
          { name: 'ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು (Emperor Krishnadevaraya)', role: 'Vijayanagara Emperor', sourceSnippet: 'ವೀರಪ್ರತಾಪ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು' },
        ],
        organizationNames: [
          { name: 'ಕನ್ನಡ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ', sourceSnippet: 'ಕನ್ನಡ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ' },
          { name: 'ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯ', sourceSnippet: 'ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ' },
        ],
        addresses: [],
        locations: [
          { location: 'ಹಂಪಿ (Hampi)', sourceSnippet: 'ಸ್ಥಳ: ಹಂಪಿ' },
          { location: 'ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯ ರಾಜಧಾನಿ', sourceSnippet: 'ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ' },
          { location: 'ತುಂಗಭದ್ರಾ ನದಿಯ ತೀರ', sourceSnippet: 'ತುಂಗಭದ್ರಾ ನದಿಯ ತೀರದ ಮೂರು' },
        ],
        dates: [
          { date: 'ಕ್ರಿ.ಶ. ೧೫೨೨ (1522 CE)', context: 'Period of Krishnadevaraya', sourceSnippet: 'ಕ್ರಿ.ಶ. ೧೫೨೨ ರ' },
          { date: 'ಶಾಲಿವಾಹನ ಶಕವರ್ಷ ೧೪೪೪', context: 'Astronomical date of inscription', sourceSnippet: 'ಶಾಲಿವಾಹನ ಶಕವರ್ಷ ೧೪೪೪ ನೇ' },
        ],
        deadlines: [],
        phoneNumbers: [],
        emailAddresses: [],
        monetaryAmounts: [],
        importantInstructions: [
          { instruction: 'Endowment granted as Sarvamanya Dana (tax-free in perpetuity)', sourceSnippet: 'ಶಾಶ್ವತವಾಗಿ ಸರ್ವಮಾನ್ಯ ದಾನವಾಗಿ ನೀಡಲಾಗಿದೆ' },
        ],
        documentReferences: [
          { reference: 'ಸಂಪುಟ: ೧೪, ಕ್ರಿ.ಶ. ೧೫೨೨', sourceSnippet: 'ಸಂಪುಟ: ೧೪, ಕ್ರಿ.ಶ. ೧೫೨೨' },
        ],
        creationDate: new Date().toISOString(),
      },
      simplification: {
        documentId: 'doc-hist-ins-002',
        simplifiedKannada: 'ಕ್ರಿ.ಶ. ೧೫೨೨ ರಲ್ಲಿ ವಿಜಯನಗರದ ರಾಜ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯರು ಹಂಪಿಯ ವಿರೂಪಾಕ್ಷ ದೇವಸ್ಥಾನಕ್ಕೆ ಬೃಹತ್ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿದರು. ದೇವರ ಪೂಜೆ ಮತ್ತು ನಂದಾದೀಪಕ್ಕಾಗಿ ತುಂಗಭದ್ರಾ ನದಿಯ ಬಳಿಯ ೩ ಕೃಷಿ ಹಳ್ಳಿಗಳನ್ನು ದಾನವಾಗಿ ನೀಡಿದರು.',
        easyEnglish: 'In 1522 CE, the Vijayanagara King Krishnadevaraya built the large temple gate tower (Raya Gopura) at Hampi Virupaksha Temple and donated 3 fertile farming villages along the Tungabhadra River to fund daily temple worship.',
        hindiExplanation: '1522 ईस्वी में विजयनगर के राजा कृष्णदेवराय ने हम्पी के विरुपाक्ष मंदिर में विशाल रायगोपुरम का निर्माण करवाया और पूजा-अर्चना के लिए तुंगभद्रा नदी किनारे के 3 गांव दान किए।',
        difficultWordsGlossary: [
          {
            word: 'ರಾಯಗೋಪುರ',
            simpleMeaningKannada: 'ರಾಜರು ಕಟ್ಟಿಸಿದ ದೊಡ್ಡ ದೇವಾಲಯ ಪ್ರವೇಶ ದ್ವಾರ',
            englishMeaning: 'Royal monumental temple entrance tower',
            usageContext: 'Architecture of Vijayanagara temples',
          },
          {
            word: 'ಸರ್ವಮಾನ್ಯ ದಾನ',
            simpleMeaningKannada: 'ಯಾವುದೇ ತೆರಿಗೆ ಇಲ್ಲದೆ ಶಾಶ್ವತವಾಗಿ ನೀಡಿದ ಭೂಮಿ',
            englishMeaning: 'Tax-free perpetual royal land endowment',
            usageContext: 'Granted to temples for religious sustenance',
          },
        ],
        paragraphComparison: [
          {
            originalSnippet: 'ಮಹಾರಾಯರು ಪಂಪಾಪತಿ ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿ ಸಮರ್ಪಿಸಿದರು.',
            simplifiedSnippet: 'ರಾಜರು ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ದೊಡ್ಡ ಗೋಪುರ ಕಟ್ಟಿಸಿಕೊಟ್ಟರು.',
          },
        ],
        creationDate: new Date().toISOString(),
      },
      chatHistory: [
        {
          id: 'hampi-msg-1',
          role: 'user',
          text: 'Which king issued this inscription and what was constructed?',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'hampi-msg-2',
          role: 'assistant',
          text: 'The inscription was issued by Emperor Sri Krishnadevaraya of Vijayanagara in 1522 CE to commemorate the construction and dedication of the Raya Gopura at Hampi Virupaksha Temple.',
          textKannada: 'ಈ ಶಾಸನವನ್ನು ವಿಜಯನಗರದ ಮಹಾರಾಜ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯರು ಕ್ರಿ.ಶ. ೧೫೨೨ ರಲ್ಲಿ ಹಂಪಿಯ ವಿರೂಪಾಕ್ಷ ದೇವಸ್ಥಾನದ ರಾಯಗೋಪುರ ನಿರ್ಮಾಣದ ಸ್ಮರಣಾರ್ಥ ಹೊರಡಿಸಿದರು.',
          isFoundInDocument: true,
          confidence: 'high',
          sourceReferences: [
            {
              sourceSnippet: 'ಶ್ರೀಮನ್ ಮಹಾರಾಜಾಧಿರಾಜ ರಾಜಪರಮೇಶ್ವರ ವೀರಪ್ರತಾಪ ಶ್ರೀಕೃಷ್ಣದೇವರಾಯ ಮಹಾರಾಯರು ವಿಜಯನಗರದ ರಾಜಧಾನಿಯಲ್ಲಿ ರಾಜ್ಯಭಾರ ಮಾಡುತ್ತಿದ್ದ ಕಾಲದಲ್ಲಿ ಈ ಧರ್ಮಶಾಸನವನ್ನು ಬರೆಯಲಾಯಿತು.',
              relevance: 'Identifies King Krishnadevaraya as the ruler.',
              pageEstimate: 1,
            },
            {
              sourceSnippet: 'ಮಹಾರಾಯರು ಪಂಪಾಪತಿ ವಿರೂಪಾಕ್ಷ ದೇವರಿಗೆ ರಾಯಗೋಪುರವನ್ನು ನಿರ್ಮಿಸಿ ಸಮರ್ಪಿಸಿದರು.',
              relevance: 'Confirms construction of the Raya Gopura.',
              pageEstimate: 1,
            },
          ],
          suggestedFollowUps: [
            'What villages were granted as endowment?',
            'What year in the Shaka calendar is recorded?',
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'doc-gov-circ-revised-004',
      filename: 'Karnataka_Govt_Circular_48_2026_Revised.jpg',
      fileType: 'image/jpeg',
      uploadDate: new Date().toISOString(),
      fileSizeFormatted: '1.5 MB',
      pageCount: 1,
      documentCategory: 'Government Document',
      processingStatus: 'ready',
      isFavourite: false,
      currentPageIndex: 0,
      pages: [
        {
          pageNumber: 1,
          originalImage: canUseCanvas
            ? createSampleDocumentImage(
                'ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ತಿದ್ದುಪಡಿ ಸುತ್ತೋಲೆ (ಪರಿಷ್ಕೃತ)',
                'ಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮/ತಿದ್ದುಪಡಿ/೨೦೨೬, ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: ೨೦-೧೧-೨೦೨೬',
                [
                  '## ವಿಷಯ: ರಾಜ್ಯಾದ್ಯಂತ ನಾಗರಿಕ ಸೇವೆಗಳ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ತಿದ್ದುಪಡಿ ಕುರಿತು.',
                  'ಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಮೂಲ ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬, ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬.',
                  'ಪ್ರಸ್ತಾವನೆ:',
                  'ಸಾರ್ವಜನಿಕರ ಹಿತದೃಷ್ಟಿಯಿಂದ ಹಾಗೂ ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವೃದ್ಧರಿಗೆ ಅನುಕೂಲವಾಗುವಂತೆ ಸೇವಾ ನಿಯಮಾವಳಿಗಳಲ್ಲಿ ತಿದ್ದುಪಡಿಗಳನ್ನು ತರಲಾಗಿದೆ.',
                  '**ಪರಿಷ್ಕೃತ ಆದೇಶಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು:**',
                  '೧. ಎಲ್ಲಾ ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಮತ್ತು ಗ್ರಾಮ ಒನ್ ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸತಕ್ಕದ್ದು.',
                  '೨. ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿಯನ್ನು ೧೫ ದಿನಗಳಿಂದ ೧೦ ಕೆಲಸದ ದಿನಗಳಿಗೆ ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ. ವಿಳಂಬಕ್ಕೆ ದಂಡ ವಿಧಿಸಲಾಗುವುದು.',
                  '೩. ಸಾಮಾನ್ಯ ನಾಗರಿಕರಿಗೆ ಪರಿಷ್ಕೃತ ಇ-ಪ್ರಮಾಣಪತ್ರ ಶುಲ್ಕವನ್ನು ₹೪೦ ಗೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
                  '೪. ಹೊಸ ನಿಯಮ: ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ (೬೦ ವರ್ಷ ಮೇಲ್ಪಟ್ಟವರಿಗೆ) ಮತ್ತು ವಿಕಲಚೇತನರಿಗೆ ಶುಲ್ಕದಿಂದ ಸಂಪೂರ್ಣ ವಿನಾಯಿತಿ ನೀಡಲಾಗಿದ್ದು, ೭ ದಿನಗಳೊಳಗೆ ಮನೆಬಾಗಿಲಿಗೆ ಸೇವೆ ಒದಗಿಸತಕ್ಕದ್ದು.',
                  '೫. ಅರ್ಜಿ ತಿರಸ್ಕೃತಗೊಂಡಲ್ಲಿ, ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ ಲಿಖಿತ ಆದೇಶವನ್ನು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡತಕ್ಕದ್ದು.',
                  '**ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ವಿಸ್ತರಿಸಲಾದ ಕೊನೆಯ ದಿನಾಂಕ:** ೧೫-೦೧-೨೦೨೭ ರವರೆಗೆ ವಿಸ್ತರಿಸಲಾಗಿದೆ.',
                  'ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬ | ಇಮೇಲ್: support-edistrict@karnataka.gov.in',
                ],
                'ಕಂದಾಯ ಇಲಾಖೆ ತಿದ್ದುಪಡಿ ಕೋಶ'
              )
            : '',
          ocrResult: {
            extractedText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ
ಸಂಖ್ಯೆ: ಸಿಆಸುಇ ೪೮/ತಿದ್ದುಪಡಿ/೨೦೨೬, ವಿಧಾನ ಸೌಧ, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: ೨೦-೧೧-೨೦೨೬

ವಿಷಯ: ರಾಜ್ಯಾದ್ಯಂತ ನಾಗರಿಕ ಸೇವೆಗಳ ಡಿಜಿಟಲೀಕರಣ ಮತ್ತು ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ತಿದ್ದುಪಡಿ ಕುರಿತು.

ಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಮೂಲ ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ ಸಿಆಸುಇ ೪೮ ಸೇಸು ೨೦೨೬, ದಿನಾಂಕ: ೧೫-೧೦-೨೦೨೬.

ಪ್ರಸ್ತಾವನೆ:
ಸಾರ್ವಜನಿಕರ ಹಿತದೃಷ್ಟಿಯಿಂದ ಹಾಗೂ ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವೃದ್ಧರಿಗೆ ಅನುಕೂಲವಾಗುವಂತೆ ಸೇವಾ ನಿಯಮಾವಳಿಗಳಲ್ಲಿ ತಿದ್ದುಪಡಿಗಳನ್ನು ತರಲಾಗಿದೆ.

ಪರಿಷ್ಕೃತ ಆದೇಶಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು:
೧. ಎಲ್ಲಾ ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸೇವಾಸಿಂಧು ಮತ್ತು ಗ್ರಾಮ ಒನ್ ಪೋರ್ಟಲ್ ಮೂಲಕವೇ ಸ್ವೀಕರಿಸತಕ್ಕದ್ದು.
೨. ಅರ್ಜಿ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿಯನ್ನು ೧೫ ದಿನಗಳಿಂದ ೧೦ ಕೆಲಸದ ದಿನಗಳಿಗೆ ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ. ವಿಳಂಬಕ್ಕೆ ದಂಡ ವಿಧಿಸಲಾಗುವುದು.
೩. ಸಾಮಾನ್ಯ ನಾಗರಿಕರಿಗೆ ಪರಿಷ್ಕೃತ ಇ-ಪ್ರಮಾಣಪತ್ರ ಶುಲ್ಕವನ್ನು ₹೪೦ ಗೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.
೪. ಹೊಸ ನಿಯಮ: ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ (೬೦ ವರ್ಷ ಮೇಲ್ಪಟ್ಟವರಿಗೆ) ಮತ್ತು ವಿಕಲಚೇತನರಿಗೆ ಶುಲ್ಕದಿಂದ ಸಂಪೂರ್ಣ ವಿನಾಯಿತಿ ನೀಡಲಾಗಿದ್ದು, ೭ ದಿನಗಳೊಳಗೆ ಮನೆಬಾಗಿಲಿಗೆ ಸೇವೆ ಒದಗಿಸತಕ್ಕದ್ದು.
೫. ಅರ್ಜಿ ತಿರಸ್ಕೃತಗೊಂಡಲ್ಲಿ, ಅದಕ್ಕೆ ಸ್ಪಷ್ಟ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ ಲಿಖಿತ ಆದೇಶವನ್ನು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡತಕ್ಕದ್ದು.

ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ವಿಸ್ತರಿಸಲಾದ ಕೊನೆಯ ದಿನಾಂಕ: ೧೫-೦೧-೨೦೨೭ ರವರೆಗೆ ವಿಸ್ತರಿಸಲಾಗಿದೆ.

ಸಂಪರ್ಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೪೨೫-೮೬೬೬ | ಇಮೇಲ್: support-edistrict@karnataka.gov.in

ವಿಶೇಷ ಕರ್ತವ್ಯಾಧಿಕಾರಿ ಹಾಗೂ ಸರ್ಕಾರದ ಅಪರ ಕಾರ್ಯದರ್ಶಿ
ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆ ಇಲಾಖೆ, ಬೆಂಗಳೂರು`,
            correctedText: '',
            detectedLanguage: 'Kannada & English',
            wordCount: 198,
            estimatedConfidence: 98,
            paragraphs: [],
            uncertainWords: [],
          },
        },
      ],
      recoveryAssessment: {
        qualityScore: 95,
        overallCondition: 'Good',
        blurLevel: 'None',
        contrastQuality: 'High',
        skewAngleEstimateDegrees: 0,
        lightingUniformity: 'Uniform',
        detectedIssues: [],
        recommendedEnhancements: [],
      },
      translations: {},
      summaries: {},
      chatHistory: [],
    },
    {
      id: 'doc-tampered-sample-005',
      filename: 'Land_Grant_Sanad_Mysore_Suspect_1948.jpg',
      fileType: 'image/jpeg',
      uploadDate: new Date().toISOString(),
      fileSizeFormatted: '2.1 MB',
      pageCount: 1,
      documentCategory: 'Government Document',
      processingStatus: 'ready',
      isFavourite: false,
      currentPageIndex: 0,
      pages: [
        {
          pageNumber: 1,
          originalImage: canUseCanvas
            ? createSampleDocumentImage(
                'ಮೈಸೂರು ಸಂಸ್ಥಾನ - ಜಮೀನು ಮಂಜೂರಾತಿ ಸನ್ನದು',
                'ಕಂದಾಯ ಕಚೇರಿ, ಮೈಸೂರು ವಿಭಾಗ | ಸನ್ನದು ಸಂಖ್ಯೆ: ಎಲ್.ಜಿ.ಆರ್. ೧೯೪೮/೨೪೧',
                [
                  '## ಮಂಜೂರಾತಿ ವಿವರ: ಕಸಬಾ ಹೋಬಳಿ ಸರ್ವೇ ನಂಬರ್ ೧೪೨/೩ ರ ಕೃಷಿ ಜಮೀನು.',
                  'ದಿನಾಂಕ: ೧೨-೦೪-೧೯೪೮ (ಪರಿಷ್ಕರಣೆ ದಾಖಲು)',
                  'ಪ್ರಸ್ತಾವನೆ:',
                  'ಶ್ರೀಯುತ ರಾಮಕೃಷ್ಣಪ್ಪ ಬಿನ್ ವೆಂಕಟಪ್ಪನವರಿಗೆ ಮೈಸೂರು ಸಂಸ್ಥಾನದ ಮಹಾರಾಜರ ಆಜ್ಞಾನುಸಾರ ೪ ಎಕರೆ ೨೦ ಗುಂಟೆ ಜಮೀನನ್ನು ಖಾಯಂ ಆಗಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.',
                  '**ಷರತ್ತುಗಳು ಮತ್ತು ಸ್ವಾಧೀನ:**',
                  '೧. ಸದರಿ ಜಮೀನಿನ ವಾರ್ಷಿಕ ಕಂದಾಯ ₹೧೨ ಮಾತ್ರ ಪಾವತಿಸತಕ್ಕದ್ದು.',
                  '೨. ಈ ಜಮೀನಿನ ಮಾಲೀಕತ್ವ ಹಕ್ಕು ಪರಭಾರೆ ಮಾಡಬಾರದು.',
                  '೩. ಹದ್ದುಬಸ್ತು: ಪೂರ್ವಕ್ಕೆ ಸರ್ಕಾರಿ ರಸ್ತೆ, ಪಶ್ಚಿಮಕ್ಕೆ ಬೋರೇಗೌಡರ ಜಮೀನು, ಉತ್ತರಕ್ಕೆ ಕಾಲುವೆ, ದಕ್ಷಿಣಕ್ಕೆ ತಿಮ್ಮಯ್ಯನವರ ತೋಪು.',
                  'ಸಹಾಯಕ ಕಮಿಷನರ್ ಕಚೇರಿ ಮೊಹರು ಮತ್ತು ಮುದ್ರೆ ದಾಖಲಿಸಲಾಗಿದೆ.',
                ],
                'ಮೈಸೂರು ಮಹಾರಾಜರ ಕಂದಾಯ ಮುದ್ರೆ',
                true
              )
            : '',
          ocrResult: {
            extractedText: `ಮೈಸೂರು ಸಂಸ್ಥಾನ
ಕಂದಾಯ ಕಚೇರಿ, ಮೈಸೂರು ವಿಭಾಗ | ಸನ್ನದು ಸಂಖ್ಯೆ: ಎಲ್.ಜಿ.ಆರ್. ೧೯೪೮/೨೪೧

ಮಂಜೂರಾತಿ ವಿವರ: ಕಸಬಾ ಹೋಬಳಿ ಸರ್ವೇ ನಂಬರ್ ೧೪೨/೩ ರ ಕೃಷಿ ಜಮೀನು.
ದಿನಾಂಕ: ೧೨-೦೪-೧೯೪೮ (ಪರಿಷ್ಕರಣೆ ದಾಖಲು)

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀಯುತ ರಾಮಕೃಷ್ಣಪ್ಪ ಬಿನ್ ವೆಂಕಟಪ್ಪನವರಿಗೆ ಮೈಸೂರು ಸಂಸ್ಥಾನದ ಮಹಾರಾಜರ ಆಜ್ಞಾನುಸಾರ ೪ ಎಕರೆ ೨೦ ಗುಂಟೆ ಜಮೀನನ್ನು ಖಾಯಂ ಆಗಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.

ಷರತ್ತುಗಳು ಮತ್ತು ಸ್ವಾಧೀನ:
೧. ಸದರಿ ಜಮೀನಿನ ವಾರ್ಷಿಕ ಕಂದಾಯ ₹೧೨ ಮಾತ್ರ ಪಾವತಿಸತಕ್ಕದ್ದು.
೨. ಈ ಜಮೀನಿನ ಮಾಲೀಕತ್ವ ಹಕ್ಕು ಪರಭಾರೆ ಮಾಡಬಾರದು.
೩. ಹದ್ದುಬಸ್ತು: ಪೂರ್ವಕ್ಕೆ ಸರ್ಕಾರಿ ರಸ್ತೆ, ಪಶ್ಚಿಮಕ್ಕೆ ಬೋರೇಗೌಡರ ಜಮೀನು, ಉತ್ತರಕ್ಕೆ ಕಾಲುವೆ, ದಕ್ಷಿಣಕ್ಕೆ ತಿಮ್ಮಯ್ಯನವರ ತೋಪು.

ಸಹಾಯಕ ಕಮಿಷನರ್ ಕಚೇರಿ ಮೊಹರು ಮತ್ತು ಮುದ್ರೆ ದಾಖಲಿಸಲಾಗಿದೆ.`,
            correctedText: '',
            detectedLanguage: 'Kannada',
            wordCount: 110,
            estimatedConfidence: 89,
            paragraphs: [],
            uncertainWords: [],
          },
        },
      ],
      recoveryAssessment: {
        qualityScore: 78,
        overallCondition: 'Moderate',
        blurLevel: 'Low',
        contrastQuality: 'Medium',
        skewAngleEstimateDegrees: 1.2,
        lightingUniformity: 'Uneven',
        detectedIssues: [
          {
            issue: 'Digital font mismatch detected in date and survey number lines',
            severity: 'high',
            description: 'Modern sans-serif typography detected on aged paper background',
          },
        ],
        recommendedEnhancements: [],
      },
      translations: {},
      summaries: {},
      chatHistory: [],
    },
  ];
}
