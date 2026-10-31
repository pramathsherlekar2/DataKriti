export interface EnhancementOptions {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  grayscale: boolean;
  sharpen: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  rotation: number; // -180 to 180 degrees
  deskew: number; // -15 to 15 degrees
  fadedTextEnhance: boolean;
  shadowReduction: boolean;
}

export const defaultEnhancementOptions: EnhancementOptions = {
  brightness: 0,
  contrast: 0,
  grayscale: false,
  sharpen: 0,
  noiseReduction: 0,
  rotation: 0,
  deskew: 0,
  fadedTextEnhance: false,
  shadowReduction: false,
};

export function applyImageEnhancements(
  imageSrc: string,
  options: EnhancementOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const totalRotation = ((options.rotation + options.deskew) * Math.PI) / 180;
        const rad = Math.abs(totalRotation);
        const sin = Math.sin(rad);
        const cos = Math.cos(rad);

        // Compute rotated bounding box
        const newWidth = Math.round(img.width * cos + img.height * sin);
        const newHeight = Math.round(img.width * sin + img.height * cos);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Fill background white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, newWidth, newHeight);

        // Rotate
        ctx.save();
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(totalRotation);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        // Pixel-level manipulations
        const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
        const d = imgData.data;
        const len = d.length;

        // Contrast factor
        const cFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
        const bOffset = (options.brightness / 100) * 255;

        for (let i = 0; i < len; i += 4) {
          let r = d[i];
          let g = d[i + 1];
          let b = d[i + 2];

          // 1. Grayscale
          if (options.grayscale || options.fadedTextEnhance || options.shadowReduction) {
            // High luminance formula suitable for text reading
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (options.grayscale) {
              r = gray;
              g = gray;
              b = gray;
            }
          }

          // 2. Faded-text enhancement (non-linear boost for dark ink strokes while pushing background to ivory/white)
          if (options.fadedTextEnhance) {
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum < 160) {
              // Darken faded ink
              r = Math.max(0, r * 0.65);
              g = Math.max(0, g * 0.65);
              b = Math.max(0, b * 0.65);
            } else {
              // Whiten yellowed or noisy background
              r = Math.min(255, r * 1.08 + 15);
              g = Math.min(255, g * 1.08 + 15);
              b = Math.min(255, b * 1.08 + 15);
            }
          }

          // 3. Shadow reduction (suppress low-frequency dark gradient regions)
          if (options.shadowReduction) {
            const avg = (r + g + b) / 3;
            if (avg < 130 && avg > 60) {
              // Lift muddy shadow tones
              r = Math.min(255, r + 45);
              g = Math.min(255, g + 45);
              b = Math.min(255, b + 45);
            }
          }

          // 4. Brightness & Contrast
          if (options.brightness !== 0) {
            r += bOffset;
            g += bOffset;
            b += bOffset;
          }

          if (options.contrast !== 0) {
            r = cFactor * (r - 128) + 128;
            g = cFactor * (g - 128) + 128;
            b = cFactor * (b - 128) + 128;
          }

          d[i] = Math.min(255, Math.max(0, r));
          d[i + 1] = Math.min(255, Math.max(0, g));
          d[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imgData, 0, 0);

        // 5. Sharpening filter if requested
        if (options.sharpen > 0) {
          const sharpenWeight = (options.sharpen / 100) * 0.8;
          const origData = ctx.getImageData(0, 0, newWidth, newHeight);
          const outputData = ctx.createImageData(newWidth, newHeight);
          const src = origData.data;
          const dst = outputData.data;

          for (let y = 1; y < newHeight - 1; y++) {
            for (let x = 1; x < newWidth - 1; x++) {
              const idx = (y * newWidth + x) * 4;
              for (let c = 0; c < 3; c++) {
                const current = src[idx + c];
                const top = src[((y - 1) * newWidth + x) * 4 + c];
                const bottom = src[((y + 1) * newWidth + x) * 4 + c];
                const left = src[(y * newWidth + (x - 1)) * 4 + c];
                const right = src[(y * newWidth + (x + 1)) * 4 + c];

                // Laplacian high-pass
                const laplacian = 5 * current - top - bottom - left - right;
                dst[idx + c] = Math.min(
                  255,
                  Math.max(0, current + sharpenWeight * (laplacian - current))
                );
              }
              dst[idx + 3] = src[idx + 3];
            }
          }
          ctx.putImageData(outputData, 0, 0);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.94));
      } catch (err) {
        console.error('Enhancement error:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}
