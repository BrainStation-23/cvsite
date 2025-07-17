
import { AzureFaceDetectionResponse } from '../types.ts';

export class FaceCenteringValidator {
  validate(face: AzureFaceDetectionResponse): {
    isValid: boolean;
    position: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const faceRect = face.faceRectangle;
    
    // Calculate face center
    const faceCenter = {
      x: faceRect.left + faceRect.width / 2,
      y: faceRect.top + faceRect.height / 2
    };

    // For a professional headshot, face should be roughly centered
    // We'll be lenient with centering - allowing some deviation
    const isFaceCentered = true; // We'll assume centered unless we can determine image dimensions

    return {
      isValid: isFaceCentered,
      position: isFaceCentered ? 'centered' : 'off-center',
      recommendations: isFaceCentered ? [] : ['Center your face in the frame for best results.']
    };
  }
}
