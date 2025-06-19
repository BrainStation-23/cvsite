import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

function imageBitmapToCanvas(imageBitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(imageBitmap, 0, 0);
  return canvas;
}

export async function validateSolidBackground(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
): Promise<{ isSolid: boolean; score: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[BackgroundValidation] Loading Mediapipe SelfieSegmentation module...');

      console.log('[BackgroundValidation] Initializing Mediapipe SelfieSegmentation...');
      
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      selfieSegmentation.setOptions({ modelSelection: 1 });

      selfieSegmentation.onResults((results: any) => {
        if (!results.segmentationMask) {
          console.warn('[BackgroundValidation] No segmentationMask returned.');
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

        // Extract background pixels
        const bgPixels: number[][] = [];
        for (let i = 0; i < maskData.length; i += 4) {
          const alpha = maskData[i + 3];
          if (alpha < 128) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            bgPixels.push([r, g, b]);
          }
        }

        if (bgPixels.length < 1000) {
          return resolve({ isSolid: false, score: 0 });
        }

        // Calculate mean RGB
        const means = [0, 0, 0];
        for (const [r, g, b] of bgPixels) {
          means[0] += r;
          means[1] += g;
          means[2] += b;
        }
        means[0] /= bgPixels.length;
        means[1] /= bgPixels.length;
        means[2] /= bgPixels.length;

        // Calculate variance
        let variance = 0;
        for (const [r, g, b] of bgPixels) {
          variance +=
            (r - means[0]) ** 2 +
            (g - means[1]) ** 2 +
            (b - means[2]) ** 2;
        }
        variance /= bgPixels.length * 3;

        const isSolid = variance < 400;
        resolve({ isSolid, score: variance });
      });

      // Prepare image input
      const inputImage =
        image instanceof ImageBitmap ? imageBitmapToCanvas(image) : image;

      console.log('[BackgroundValidation] Sending image to Mediapipe...');
      selfieSegmentation.send({ image: inputImage });

    } catch (err) {
      console.error('[BackgroundValidation] Error:', err);
      reject(
        new Error(
          'Failed to process image with Mediapipe: ' +
            (err instanceof Error ? err.message : String(err))
        )
      );
    }
  });
}
