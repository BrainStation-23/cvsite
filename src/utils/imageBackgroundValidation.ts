// Utility for background solidness validation using Mediapipe Selfie Segmentation
// This file assumes you will install @mediapipe/selfie_segmentation and @mediapipe/drawing_utils


/**
 * Analyze if the background of an image is solid (low color variance, not busy)
 * @param image HTMLImageElement | HTMLCanvasElement | ImageBitmap
 * @returns Promise<{ isSolid: boolean, score: number }>
 */
function imageBitmapToCanvas(imageBitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(imageBitmap, 0, 0);
  return canvas;
}

export async function validateSolidBackground(image: HTMLImageElement | HTMLCanvasElement | ImageBitmap): Promise<{ isSolid: boolean, score: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[BackgroundValidation] Loading Mediapipe SelfieSegmentation module...');
      const SelfieSegmentationModule = await import('@mediapipe/selfie_segmentation');
      const SelfieSegmentation =
        typeof SelfieSegmentationModule.SelfieSegmentation === 'function'
          ? SelfieSegmentationModule.SelfieSegmentation
          : typeof SelfieSegmentationModule.default === 'function'
            ? SelfieSegmentationModule.default
            : undefined;
      if (typeof SelfieSegmentation !== 'function') {
        const keys = Object.keys(SelfieSegmentationModule).join(', ');
        throw new Error('SelfieSegmentation is not a constructor. Module keys: ' + keys);
      }
      console.log('[BackgroundValidation] Initializing Mediapipe SelfieSegmentation instance...');
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file: string) => {
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
          console.log(`[BackgroundValidation] Loading Mediapipe file: ${url}`);
          return url;
        },
      });
      selfieSegmentation.setOptions({ modelSelection: 1 });

      selfieSegmentation.onResults(async (results: any) => {
        if (!results.segmentationMask) {
          console.warn('[BackgroundValidation] No segmentationMask returned by Mediapipe. Results:', results);
          return resolve({ isSolid: false, score: 0 });
        }
        // Draw mask to canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = results.segmentationMask.width;
      maskCanvas.height = results.segmentationMask.height;
      const ctx = maskCanvas.getContext('2d')!;
      ctx.drawImage(results.segmentationMask, 0, 0);
      const maskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;

      // Draw original image to canvas
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = maskCanvas.width;
      imgCanvas.height = maskCanvas.height;
      const imgCtx = imgCanvas.getContext('2d')!;
      imgCtx.drawImage(image, 0, 0, imgCanvas.width, imgCanvas.height);
      const imgData = imgCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.height).data;

      // Collect background pixels
      const bgPixels: number[][] = [];
      for (let i = 0; i < maskData.length; i += 4) {
        // Mediapipe mask: 0 (background), 255 (person)
        const maskAlpha = maskData[i + 3];
        if (maskAlpha < 128) { // background pixel
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          bgPixels.push([r, g, b]);
        }
      }
      if (bgPixels.length < 1000) {
        // Not enough background detected
        return resolve({ isSolid: false, score: 0 });
      }
      // Calculate variance of RGB channels
      const means = [0, 0, 0];
      for (const [r, g, b] of bgPixels) {
        means[0] += r;
        means[1] += g;
        means[2] += b;
      }
      means[0] /= bgPixels.length;
      means[1] /= bgPixels.length;
      means[2] /= bgPixels.length;
      let variance = 0;
      for (const [r, g, b] of bgPixels) {
        variance += (r - means[0]) ** 2 + (g - means[1]) ** 2 + (b - means[2]) ** 2;
      }
      variance /= (bgPixels.length * 3);
      // Heuristic: variance below 400 means "solid"
      const isSolid = variance < 400;
      resolve({ isSolid, score: variance });
    });

    // Prepare input
    let inputImage: HTMLImageElement | HTMLCanvasElement;
    if (image instanceof ImageBitmap) {
      console.log('[BackgroundValidation] Converting ImageBitmap to Canvas.');
      inputImage = imageBitmapToCanvas(image);
    } else {
      inputImage = image;
    }
    try {
      selfieSegmentation.send({ image: inputImage });
      console.log('[BackgroundValidation] Sent image to Mediapipe for segmentation.');
    } catch (err) {
      console.error('[BackgroundValidation] Error sending image to Mediapipe:', err);
      reject(new Error('Failed to send image to Mediapipe: ' + (err instanceof Error ? err.message : String(err))));
    }
    } catch (err) {
      console.error('[BackgroundValidation] Error initializing Mediapipe SelfieSegmentation:', err);
      reject(new Error('Failed to initialize Mediapipe SelfieSegmentation: ' + (err instanceof Error ? err.message : String(err))));
    }
  });
}

