/**
 * Analyze if the person in the image has proper posture (slight shoulder angle with head facing camera)
 * @param image HTMLImageElement | HTMLCanvasElement | ImageBitmap
 * @returns Promise<{ hasGoodPosture: boolean, shoulderAngle: number, details: string }>
 */
function imageBitmapToCanvas(imageBitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(imageBitmap, 0, 0);
  return canvas;
}

export async function validateImagePosture(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
): Promise<{ hasGoodPosture: boolean; shoulderAngle: number; details: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[PostureValidation] Loading Mediapipe Pose module...');
      const mod = await import('@mediapipe/pose');

      console.log('[PostureValidation] Initializing Mediapipe Pose instance...');
      const pose = new mod.default.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(async (results: any) => {
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          return resolve({
            hasGoodPosture: false,
            shoulderAngle: 0,
            details: 'No person detected in the image',
          });
        }

        try {
          const landmarks = results.poseLandmarks;

          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          const nose = landmarks[0];
          const leftEar = landmarks[7];
          const rightEar = landmarks[8];

          if (!leftShoulder || !rightShoulder || !nose) {
            return resolve({
              hasGoodPosture: false,
              shoulderAngle: 0,
              details: 'Could not detect required body parts (shoulders and head)',
            });
          }

          // Shoulder angle calculation with normalization
          const dx = rightShoulder.x - leftShoulder.x;
          const dy = rightShoulder.y - leftShoulder.y;
          let shoulderAngleDeg = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
          shoulderAngleDeg = shoulderAngleDeg % 180;
          if (shoulderAngleDeg > 90) {
            shoulderAngleDeg = 180 - shoulderAngleDeg;
          }

          // Check head facing forward
          let headFacingForward = true;
          let headDetails = '';

          if (leftEar && rightEar) {
            const earDeltaX = Math.abs(leftEar.x - rightEar.x);
            const earDeltaY = Math.abs(leftEar.y - rightEar.y);

            if (earDeltaX < 0.1) {
              headFacingForward = false;
              headDetails = 'Head turned too much to the side';
            }
          } else {
            const leftVisible = leftEar && leftEar.visibility > 0.3;
            const rightVisible = rightEar && rightEar.visibility > 0.3;

            if (!leftVisible && !rightVisible) {
              headFacingForward = false;
              headDetails = 'Head position unclear - ears not visible';
            }
          }

          const idealMinAngle = 5;
          const idealMaxAngle = 20;
          const hasGoodShoulderAngle = shoulderAngleDeg >= idealMinAngle && shoulderAngleDeg <= idealMaxAngle;
          const hasGoodPosture = hasGoodShoulderAngle && headFacingForward;

          let details = '';
          if (!hasGoodShoulderAngle && !headFacingForward) {
            details = `Poor shoulder angle (${shoulderAngleDeg.toFixed(1)}°, ideal: 5–20°) and ${headDetails}`;
          } else if (!hasGoodShoulderAngle) {
            details = `Shoulder angle ${shoulderAngleDeg.toFixed(1)}° (ideal: 5–20°)`;
          } else if (!headFacingForward) {
            details = headDetails;
          } else {
            details = `Good posture - shoulder angle: ${shoulderAngleDeg.toFixed(1)}°`;
          }

          resolve({
            hasGoodPosture,
            shoulderAngle: shoulderAngleDeg,
            details,
          });

        } catch (analysisError) {
          console.error('[PostureValidation] Error analyzing pose landmarks:', analysisError);
          resolve({
            hasGoodPosture: false,
            shoulderAngle: 0,
            details: 'Error analyzing posture',
          });
        }
      });

      let inputImage: HTMLImageElement | HTMLCanvasElement;
      if (image instanceof ImageBitmap) {
        console.log('[PostureValidation] Converting ImageBitmap to Canvas.');
        inputImage = imageBitmapToCanvas(image);
      } else {
        inputImage = image;
      }

      try {
        pose.send({ image: inputImage });
        console.log('[PostureValidation] Sent image to Mediapipe for pose analysis.');
      } catch (err) {
        console.error('[PostureValidation] Error sending image to Mediapipe:', err);
        reject(new Error('Failed to send image to Mediapipe: ' + (err instanceof Error ? err.message : String(err))));
      }
    } catch (err) {
      console.error('[PostureValidation] Error initializing Mediapipe Pose:', err);
      reject(new Error('Failed to initialize Mediapipe Pose: ' + (err instanceof Error ? err.message : String(err))));
    }
  });
}
