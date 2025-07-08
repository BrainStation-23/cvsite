
import { AzureFaceDetectionResponse } from '../types.ts';

export class HeadPoseValidator {
  validate(face: AzureFaceDetectionResponse): {
    isValid: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const attributes = face.faceAttributes;
    
    let goodHeadPose = true;
    
    if (attributes?.headPose) {
      const { pitch, roll, yaw } = attributes.headPose;
      
      // Allow some tolerance for natural head positioning
      if (Math.abs(pitch) > 20 || Math.abs(roll) > 15 || Math.abs(yaw) > 25) {
        goodHeadPose = false;
        recommendations.push('Try to keep your head straight and look directly at the camera.');
      }
    }

    return { isValid: goodHeadPose, recommendations };
  }
}
