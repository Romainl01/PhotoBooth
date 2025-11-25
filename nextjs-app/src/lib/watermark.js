/**
 * Watermark Utility for Morpheo
 *
 * Adds "created with Morpheo - morpheo-phi.vercel.app/" watermark to images
 * using HTML5 Canvas API
 */

/**
 * Add watermark to an image
 * @param {string} imageUrl - The image URL (can be data URL or blob URL)
 * @returns {Promise<string>} Promise that resolves to watermarked image blob URL
 */
export async function addWatermark(imageUrl) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('[Morpheo] Watermark - Image loaded, dimensions:', img.width, 'x', img.height);

      const devicePixelRatio = window.devicePixelRatio || 1;
      console.log('[Morpheo] Watermark - Device pixel ratio:', devicePixelRatio);

      // Cap maximum dimensions to prevent mobile crashes
      const MAX_DIMENSION = 4096;
      let drawWidth = img.width;
      let drawHeight = img.height;

      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        const scaleFactor = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height);
        drawWidth = Math.floor(img.width * scaleFactor);
        drawHeight = Math.floor(img.height * scaleFactor);
        console.log('[Morpheo] Watermark - Image scaled down to:', drawWidth, 'x', drawHeight);
      }

      // Set canvas size to match image with device pixel ratio for sharp rendering
      canvas.width = drawWidth * devicePixelRatio;
      canvas.height = drawHeight * devicePixelRatio;

      // Scale the canvas back down using CSS for proper display
      canvas.style.width = drawWidth + 'px';
      canvas.style.height = drawHeight + 'px';

      // Scale the drawing context so everything draws at the higher resolution
      ctx.scale(devicePixelRatio, devicePixelRatio);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the original image
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

      // Watermark text
      const watermarkText = 'created with Morpheo - morpheo.xyz';

      // Dynamic font sizing based on image dimensions
      const minFontSize = 80;
      const widthBasedSize = drawWidth / 2.5;
      const heightBasedSize = drawHeight / 2.5;
      const calculatedSize = Math.min(widthBasedSize, heightBasedSize);
      const fontSize = Math.max(minFontSize, calculatedSize);

      console.log('[Morpheo] Watermark - Font size calculation:');
      console.log('  - Minimum font size:', minFontSize);
      console.log('  - Width-based size (width/2.5):', widthBasedSize);
      console.log('  - Height-based size (height/2.5):', heightBasedSize);
      console.log('  - Calculated size (min of width/height):', calculatedSize);
      console.log('  - Final font size (max of min and calculated):', fontSize);

      // Use IBM Plex Mono with fallbacks
      ctx.font = `900 ${fontSize}px var(--font-ibm-plex-mono), "IBM Plex Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';

      // Position at bottom-right
      ctx.textAlign = 'end';
      ctx.textBaseline = 'bottom';

      // Dynamic padding
      const padding = Math.max(10, Math.min(drawWidth / 50, drawHeight / 50));
      const x = drawWidth - padding;
      const y = drawHeight - padding;

      console.log('[Morpheo] Watermark - Position calculation:');
      console.log('  - Padding:', padding);
      console.log('  - X position:', x);
      console.log('  - Y position:', y);
      console.log('  - Text:', watermarkText);

      // Add shadow for contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      console.log('[Morpheo] Watermark - Drawing text with font:', ctx.font);
      ctx.fillText(watermarkText, x, y);
      console.log('[Morpheo] Watermark - Text drawn successfully');

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('[Morpheo] Watermark - Blob created successfully, size:', blob.size, 'bytes');
            const watermarkedUrl = URL.createObjectURL(blob);
            console.log('[Morpheo] Watermark - Final watermarked URL created');
            resolve(watermarkedUrl);
          } else {
            console.error('[Morpheo] Watermark - Failed to create blob');
            reject(new Error('Failed to create watermarked image'));
          }
        },
        'image/jpeg',
        0.95 // High quality
      );
    };

    img.onerror = () => {
      console.error('[Morpheo] Watermark - Failed to load image');
      reject(new Error('Failed to load image for watermarking'));
    };

    img.src = imageUrl;
  });
}
