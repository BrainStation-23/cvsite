
/**
 * Analyze if the image is a close-up shot by detecting face size relative to image dimensions
 * @param image HTMLImageElement | HTMLCanvasElement | ImageBitmap
 * @returns Promise<{ isCloseup: boolean, faceHeightRatio: number, details: string }>
 */
function imageBitmapToCanvas(imageBitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(imageBitmap, 0, 0);
  return canvas;
}

export async function validateImageCloseup(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
): Promise<{ isCloseup: boolean; faceHeightRatio: number; details: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[CloseupValidation] Loading Mediapipe Face Detection module...');
      const mod = await import('@mediapipe/face_detection');

      console.log('[CloseupValidation] Initializing Mediapipe Face Detection instance...');
      const faceDetection = new mod.default.FaceDetection({
        locateFile: (file: string) => {
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          console.log(`[CloseupValidation] Loading Mediapipe file: ${url}`);
          return url;
        },
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults(async (results: any) => {
        if (!results.detections || results.detections.length === 0) {
          console.warn('[CloseupValidation] No face detected in the image');
          return resolve({
            isCloseup: false,
            faceHeightRatio: 0,
            details: 'No face detected in the image',
          });
        }

        if (results.detections.length > 1) {
          console.warn('[CloseupValidation] Multiple faces detected, using the largest one');
        }

        try {
          // Get the largest face (first detection is usually the most prominent)
          const detection = results.detections[0];
          const boundingBox = detection.boundingBox;
          
          // Get image dimensions
          let imageWidth: number, imageHeight: number;
          if (image instanceof HTMLImageElement) {
            imageWidth = image.naturalWidth || image.width;
            imageHeight = image.naturalHeight || image.height;
          } else if (image instanceof HTMLCanvasElement) {
            imageWidth = image.width;
            imageHeight = image.height;
          } else { // ImageBitmap
            imageWidth = image.width;
            imageHeight = image.height;
          }

          console.log('[CloseupValidation] Image dimensions:', { imageWidth, imageHeight });
          console.log('[CloseupValidation] Face bounding box:', boundingBox);

          // Calculate face dimensions relative to image
          const faceWidth = boundingBox.width * imageWidth;
          const faceHeight = boundingBox.height * imageHeight;
          
          // Calculate ratios
          const faceHeightRatio = (faceHeight / imageHeight) * 100;
          const faceWidthRatio = (faceWidth / imageWidth) * 100;

          console.log('[CloseupValidation] Face dimensions:', {
            faceWidth,
            faceHeight,
            faceHeightRatio: faceHeightRatio.toFixed(2) + '%',
            faceWidthRatio: faceWidthRatio.toFixed(2) + '%'
          });

          // Determine if it's a close-up based on face height ratio
          let isCloseup: boolean;
          let details: string;

          if (faceHeightRatio >= 30) {
            isCloseup = true;
            details = `Close-up shot detected - face occupies ${faceHeightRatio.toFixed(1)}% of image height`;
          } else if (faceHeightRatio <= 20) {
            isCloseup = false;
            details = `Distant/full-body shot detected - face occupies only ${faceHeightRatio.toFixed(1)}% of image height`;
          } else {
            // Between 20-30% is considered medium shot
            isCloseup = false;
            details = `Medium shot detected - face occupies ${faceHeightRatio.toFixed(1)}% of image height (borderline case)`;
          }

          console.log('[CloseupValidation] Analysis result:', {
            isCloseup,
            faceHeightRatio: faceHeightRatio.toFixed(2),
            details
          });

          resolve({
            isCloseup,
            faceHeightRatio: Number(faceHeightRatio.toFixed(2)),
            details,
          });

        } catch (analysisError) {
          console.error('[CloseupValidation] Error analyzing face detection results:', analysisError);
          resolve({
            isCloseup: false,
            faceHeightRatio: 0,
            details: 'Error analyzing face detection results',
          });
        }
      });

      let inputImage: HTMLImageElement | HTMLCanvasElement;
      if (image instanceof ImageBitmap) {
        console.log('[CloseupValidation] Converting ImageBitmap to Canvas.');
        inputImage = imageBitmapToCanvas(image);
      } else {
        inputImage = image;
      }

      try {
        faceDetection.send({ image: inputImage });
        console.log('[CloseupValidation] Sent image to Mediapipe for face detection.');
      } catch (err) {
        console.error('[CloseupValidation] Error sending image to Mediapipe:', err);
        reject(new Error('Failed to send image to Mediapipe: ' + (err instanceof Error ? err.message : String(err))));
      }
    } catch (err) {
      console.error('[CloseupValidation] Error initializing Mediapipe Face Detection:', err);
      reject(new Error('Failed to initialize Mediapipe Face Detection: ' + (err instanceof Error ? err.message : String(err))));
    }
  });
}
