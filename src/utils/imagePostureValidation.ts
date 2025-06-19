
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
        locateFile: (file: string) => {
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          console.log(`[PostureValidation] Loading Mediapipe file: ${url}`);
          return url;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(async (results: any) => {
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          console.warn('[PostureValidation] No pose landmarks detected');
          return resolve({ 
            hasGoodPosture: false, 
            shoulderAngle: 0, 
            details: 'No person detected in the image' 
          });
        }

        try {
          // Get key landmarks
          const landmarks = results.poseLandmarks;
          
          // Shoulder landmarks (11: left shoulder, 12: right shoulder)
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          
          // Nose landmark (0: nose) to check head direction
          const nose = landmarks[0];
          
          // Ear landmarks (7: left ear, 8: right ear)
          const leftEar = landmarks[7];
          const rightEar = landmarks[8];

          if (!leftShoulder || !rightShoulder || !nose) {
            return resolve({ 
              hasGoodPosture: false, 
              shoulderAngle: 0, 
              details: 'Could not detect required body parts (shoulders and head)' 
            });
          }

          // Calculate shoulder angle
          const shoulderDeltaY = rightShoulder.y - leftShoulder.y;
          const shoulderDeltaX = rightShoulder.x - leftShoulder.x;
          const shoulderAngleRad = Math.atan2(shoulderDeltaY, shoulderDeltaX);
          const shoulderAngleDeg = Math.abs(shoulderAngleRad * (180 / Math.PI));

          // Check if head is facing forward (ears should be relatively visible)
          let headFacingForward = true;
          let headDetails = '';
          
          if (leftEar && rightEar) {
            // If both ears are visible, check if they're relatively aligned
            const earDeltaX = Math.abs(leftEar.x - rightEar.x);
            const earDeltaY = Math.abs(leftEar.y - rightEar.y);
            
            // Head should be relatively straight (not turned too much to one side)
            if (earDeltaX < 0.1) { // Too much side turn
              headFacingForward = false;
              headDetails = 'Head turned too much to the side';
            }
          } else {
            // One ear not visible - check visibility confidence
            const leftEarVisible = leftEar && leftEar.visibility > 0.3;
            const rightEarVisible = rightEar && rightEar.visibility > 0.3;
            
            if (!leftEarVisible && !rightEarVisible) {
              headFacingForward = false;
              headDetails = 'Head position unclear - ears not visible';
            }
          }

          // Ideal shoulder angle is between 5-20 degrees
          const idealMinAngle = 5;
          const idealMaxAngle = 20;
          const hasGoodShoulderAngle = shoulderAngleDeg >= idealMinAngle && shoulderAngleDeg <= idealMaxAngle;

          // Overall posture assessment
          const hasGoodPosture = hasGoodShoulderAngle && headFacingForward;

          let details = '';
          if (!hasGoodShoulderAngle && !headFacingForward) {
            details = `Poor shoulder angle (${shoulderAngleDeg.toFixed(1)}°, ideal: 5-20°) and ${headDetails}`;
          } else if (!hasGoodShoulderAngle) {
            details = `Shoulder angle ${shoulderAngleDeg.toFixed(1)}° (ideal: 5-20°)`;
          } else if (!headFacingForward) {
            details = headDetails;
          } else {
            details = `Good posture - shoulder angle: ${shoulderAngleDeg.toFixed(1)}°`;
          }

          resolve({ 
            hasGoodPosture, 
            shoulderAngle: shoulderAngleDeg, 
            details 
          });

        } catch (analysisError) {
          console.error('[PostureValidation] Error analyzing pose landmarks:', analysisError);
          resolve({ 
            hasGoodPosture: false, 
            shoulderAngle: 0, 
            details: 'Error analyzing posture' 
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
