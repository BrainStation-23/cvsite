
import { AzureFaceDetectionResponse } from '../types.ts';

export class AccessoriesValidator {
  validate(face: AzureFaceDetectionResponse): {
    isValid: boolean;
    accessories: string[];
    glasses: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const accessoryTypes: string[] = [];
    const attributes = face.faceAttributes;
    
    let hasNoSunglassesOrHats = true;

    // Check for sunglasses
    if (attributes?.glasses && attributes.glasses !== 'NoGlasses' && attributes.glasses !== 'ReadingGlasses') {
      if (attributes.glasses === 'Sunglasses') {
        hasNoSunglassesOrHats = false;
        accessoryTypes.push('sunglasses');
        recommendations.push('Please remove sunglasses for a professional headshot.');
      }
    }

    // Check for hats/headwear
    if (attributes?.accessories) {
      for (const accessory of attributes.accessories) {
        if (accessory.type === 'headwear' && accessory.confidence > 0.5) {
          hasNoSunglassesOrHats = false;
          accessoryTypes.push('hat/headwear');
          recommendations.push('Please remove any hats or headwear for a professional headshot.');
        }
      }
    }

    return {
      isValid: hasNoSunglassesOrHats,
      accessories: accessoryTypes,
      glasses: attributes?.glasses || 'unknown',
      recommendations
    };
  }
}
