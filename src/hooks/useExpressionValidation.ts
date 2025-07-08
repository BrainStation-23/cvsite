
import { useState, useCallback } from 'react';
import { 
  validateFacialExpression, 
  fileToImageElement, 
  loadFaceApiModels,
  ExpressionValidationResult 
} from '@/utils/imageValidation/imageExpressionValidation';

export const useExpressionValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const initializeModels = useCallback(async () => {
    if (modelsLoaded) return;
    
    try {
      await loadFaceApiModels();
      setModelsLoaded(true);
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      throw error;
    }
  }, [modelsLoaded]);

  const validateExpression = useCallback(async (file: File): Promise<ExpressionValidationResult> => {
    setIsLoading(true);
    
    try {
      // Ensure models are loaded
      await initializeModels();
      
      // Convert file to image element
      const imageElement = await fileToImageElement(file);
      
      // Validate expression
      const result = await validateFacialExpression(imageElement);
      
      return result;
    } catch (error) {
      console.error('Expression validation failed:', error);
      return {
        isValid: false,
        confidence: 0,
        detectedExpressions: {},
        feedback: 'Failed to validate expression',
        recommendations: ['Please try again with a clearer image']
      };
    } finally {
      setIsLoading(false);
    }
  }, [initializeModels]);

  return {
    validateExpression,
    isLoading,
    modelsLoaded,
    initializeModels
  };
};
