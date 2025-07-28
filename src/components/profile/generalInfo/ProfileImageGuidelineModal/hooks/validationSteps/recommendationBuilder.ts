
import { ValidationResult } from '../../types';

export const buildRecommendations = (
  validationResults: ValidationResult[]
): string[] => {
  const recommendations: string[] = [];

  // Check each validation result and add specific recommendations
  validationResults.forEach(result => {
    if (!result.passed) {
      switch (result.type) {
        case 'background':
          recommendations.push('Use a solid, neutral background for better professional appearance.');
          break;
        case 'posture':
          recommendations.push('Maintain good posture with shoulders slightly angled (5-20°) and head facing the camera.');
          break;
        case 'closeup':
          recommendations.push('Ensure your face occupies at least 30% of the image height for a proper close-up shot.');
          break;
      }
    }
  });

  // Add general recommendations based on overall assessment
  const allPassed = validationResults.every(r => r.passed);
  
  if (allPassed) {
    recommendations.push('Great! This looks like a professional headshot.');
  } else if (recommendations.length === 0) {
    recommendations.push('Consider retaking the photo with better lighting and positioning.');
  }

  // Add general professional photo tips
  if (!allPassed) {
    recommendations.push('Make sure you are well-lit and looking directly at the camera.');
    recommendations.push('Remove any sunglasses, hats, or distracting accessories.');
  }

  return recommendations;
};
