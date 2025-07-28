
import { ValidationResult } from '../../types';
import { validateImageCloseup } from '@/utils/imageValidation/imageCloseupValidation';

export const runCloseupValidation = async (file: File): Promise<ValidationResult> => {
  try {
    const img = await createImageBitmap(file);
    const closeup = await validateImageCloseup(img);
    return {
      id: 'closeup',
      type: 'closeup',
      label: 'Close-up shot detected',
      passed: closeup.isCloseup,
      details: closeup.details,
      source: 'local',
    };
  } catch (e) {
    console.error('Close-up validation error:', e);
    return {
      id: 'closeup',
      type: 'closeup',
      label: 'Close-up shot detected',
      passed: false,
      details: 'Error analyzing close-up',
      source: 'local',
    };
  }
};
