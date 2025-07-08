
import { ValidationResult } from '../../types';
import { validateFacialExpression, fileToImageElement, ExpressionValidationResult } from '@/utils/imageValidation/imageExpressionValidation';

export const runExpressionValidation = async (file: File): Promise<ValidationResult> => {
  try {
    // Convert file to image element
    const imageElement = await fileToImageElement(file);
    
    // Validate facial expression
    const result: ExpressionValidationResult = await validateFacialExpression(imageElement);
    
    return {
      id: 'expression',
      label: 'Facial Expression',
      passed: result.isValid,
      details: result.feedback,
      source: 'local'
    };
  } catch (error) {
    console.error('Expression validation failed:', error);
    return {
      id: 'expression',
      label: 'Facial Expression',
      passed: false,
      details: 'Failed to analyze facial expression',
      source: 'local'
    };
  }
};
