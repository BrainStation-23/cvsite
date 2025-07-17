
import { AzureFaceDetectionResponse } from '../types.ts';

export class GroupPhotoValidator {
  validate(faces: AzureFaceDetectionResponse[]): {
    isValid: boolean;
    faceCount: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const faceCount = faces.length;
    
    if (faceCount === 0) {
      recommendations.push('No face detected in the image. Please ensure your face is clearly visible.');
      return { isValid: false, faceCount, recommendations };
    }
    
    if (faceCount > 1) {
      recommendations.push('Multiple faces detected. Please use a photo with only yourself.');
      return { isValid: false, faceCount, recommendations };
    }

    return { isValid: true, faceCount, recommendations };
  }
}
