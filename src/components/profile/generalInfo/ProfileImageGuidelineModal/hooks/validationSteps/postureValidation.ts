
import { ValidationResult } from '../../types';
import { validateImagePosture } from '@/utils/imageValidation/imagePostureValidation';

export const runPostureValidation = async (file: File): Promise<ValidationResult> => {
  try {
    const img = await createImageBitmap(file);
    const posture = await validateImagePosture(img);
    return {
      id: 'posture',
      label: 'Good posture (5-20° shoulder angle)',
      passed: posture.hasGoodPosture,
      details: posture.details,
      source: 'local',
    };
  } catch (e) {
    console.error('Posture validation error:', e);
    return {
      id: 'posture',
      label: 'Good posture (5-20° shoulder angle)',
      passed: false,
      details: 'Error analyzing posture',
      source: 'local',
    };
  }
};
