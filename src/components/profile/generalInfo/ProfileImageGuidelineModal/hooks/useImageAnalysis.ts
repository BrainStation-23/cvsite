
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ImageAnalysisResult, ValidationResult, ValidationProgress } from '../types';
import { runBackgroundValidation } from './validationSteps/backgroundValidation';
import { runPostureValidation } from './validationSteps/postureValidation';
import { runCloseupValidation } from './validationSteps/closeupValidation';
import { runExpressionValidation } from './validationSteps/expressionValidation';
import { runAzureValidation } from './validationSteps/azureValidation';
import { ProgressManager } from './validationSteps/progressManager';
import { buildRecommendations } from './validationSteps/recommendationBuilder';

export const useImageAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setValidationResults([]);

      const progressManager = new ProgressManager(setValidationProgress);
      const localResults: ValidationResult[] = [];

      // 1. Background validation
      progressManager.updateProgress('background', 'running');
      const bgResult = await runBackgroundValidation(file);
      localResults.push(bgResult);
      progressManager.updateProgress('background', 'completed', bgResult.passed, bgResult.details);

      // 2. Posture validation
      progressManager.updateProgress('posture', 'running');
      const postureResult = await runPostureValidation(file);
      localResults.push(postureResult);
      progressManager.updateProgress('posture', 'completed', postureResult.passed, postureResult.details);

      // 3. Close-up validation
      progressManager.updateProgress('closeup', 'running');
      const closeupResult = await runCloseupValidation(file);
      localResults.push(closeupResult);
      progressManager.updateProgress('closeup', 'completed', closeupResult.passed, closeupResult.details);

      // 4. Expression validation
      progressManager.updateProgress('expression', 'running');
      const expressionResult = await runExpressionValidation(file);
      localResults.push(expressionResult);
      progressManager.updateProgress('expression', 'completed', expressionResult.passed, expressionResult.details);

      // Update validation results with all local results
      setValidationResults([...localResults]);

      // 5. Azure validation
      progressManager.updateProgress('azure', 'running');
      const azureData = await runAzureValidation(file);
      
      // Update subtasks for facial features and composition
      progressManager.updateProgress('azure', 'completed', azureData.isNotGroupPhoto, undefined, 'not_group');
      progressManager.updateProgress('azure', 'completed', azureData.isFaceCentered, undefined, 'face_centered');
      progressManager.updateProgress('azure', 'completed', azureData.hasNoSunglassesOrHats, undefined, 'no_accessories');
      
      // Mark main azure task as completed
      const allAzurePassed = azureData.isNotGroupPhoto && azureData.isFaceCentered && azureData.hasNoSunglassesOrHats;
      progressManager.updateProgress('azure', 'completed', allAzurePassed);

      // Build recommendations
      const recommendations = buildRecommendations(localResults, azureData);

      // Build final result
      const mergedResult = {
        ...azureData,
        background: {
          passed: bgResult.passed,
          details: bgResult.details,
        },
        posture: {
          passed: postureResult.passed,
          shoulderAngle: postureResult.details.includes('angle:') ? 
            parseFloat(postureResult.details.match(/angle: ([\d.]+)°/)?.[1] || '0') : 0,
          details: postureResult.details,
        },
        closeup: {
          passed: closeupResult.passed,
          faceHeightRatio: closeupResult.details.includes('occupies') ? 
            parseFloat(closeupResult.details.match(/([\d.]+)%/)?.[1] || '0') : 0,
          details: closeupResult.details,
        },
        expression: {
          passed: expressionResult.passed,
          details: expressionResult.details,
        },
        details: {
          ...azureData.details,
          recommendations,
        },
      };

      setAnalysisResult(mergedResult);
      
      // Convert file to base64 for return
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      return base64;

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
      
      const progressManager = new ProgressManager(setValidationProgress);
      progressManager.updateProgress('azure', 'failed');
      
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = useCallback(() => {
    setError(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setValidationResults([]);
    setValidationProgress([]);
  }, []);

  return {
    analysisResult,
    isAnalyzing,
    validationResults,
    validationProgress,
    error,
    analyzeImage,
    resetAnalysis,
  };
};
