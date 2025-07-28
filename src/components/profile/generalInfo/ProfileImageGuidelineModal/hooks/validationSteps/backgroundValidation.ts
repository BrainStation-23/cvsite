
import { ValidationResult } from '../../types';
import { validateSolidBackground } from '@/utils/imageValidation/imageBackgroundValidation';

export const runBackgroundValidation = async (file: File): Promise<ValidationResult> => {
  try {
    const img = await createImageBitmap(file);
    const bg = await validateSolidBackground(img);
    return {
      id: 'background',
      type: 'background',
      label: 'Background is solid',
      passed: bg.isSolid,
      details: `Variance: ${Math.round(bg.score)}`,
      source: 'local',
    };
  } catch (e) {
    return {
      id: 'background',
      type: 'background',
      label: 'Background is solid',
      passed: false,
      details: 'Error running background check',
      source: 'local',
    };
  }
};
