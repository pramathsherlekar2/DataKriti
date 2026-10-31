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
      translations: {},
      summaries: {},
      chatHistory: [],
    },
  ];
}
