
import { ValidationResult } from '../../types';

export const buildRecommendations = (
  localResults: ValidationResult[],
  azureData: any
): string[] => {
  const recommendations: string[] = [];

  // Check local validation results
  const bgResult = localResults.find(r => r.id === 'background');
  if (bgResult && !bgResult.passed) {
    recommendations.push('Use a plain, solid-color background like a wall or curtain.');
  }

  const postureResult = localResults.find(r => r.id === 'posture');
  if (postureResult && !postureResult.passed) {
    recommendations.push('Stand or sit straight with shoulders at a slight angle (5-20°) to the camera.');
  }

  const closeupResult = localResults.find(r => r.id === 'closeup');
  if (closeupResult && !closeupResult.passed) {
    recommendations.push('Take a close-up shot where your face occupies at least 30% of the image height.');
  }

  // Check Azure validation results
  if (!azureData.isNotGroupPhoto) {
    recommendations.push('Make sure the photo contains only you (no group photos).');
  }
  if (!azureData.isFaceCentered) {
    recommendations.push('Center your face in the frame for best results.');
  }
  if (!azureData.hasNoSunglassesOrHats) {
    recommendations.push('Remove sunglasses, hats, or any accessories covering your face.');
  }

  return recommendations;
};
