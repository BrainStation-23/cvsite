
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateSolidBackground } from '@/utils/imageBackgroundValidation';
import { validateImagePosture } from '@/utils/imagePostureValidation';
import { ImageAnalysisResult, ValidationResult, ValidationProgress } from '../types';

export const useImageAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initializeProgress = () => {
    const initialProgress: ValidationProgress[] = [
      { id: 'background', label: 'Checking background quality', status: 'pending' },
      { id: 'posture', label: 'Analyzing posture and positioning', status: 'pending' },
      { id: 'azure', label: 'Verifying facial features and composition', status: 'pending' },
    ];
    setValidationProgress(initialProgress);
  };

  const updateProgress = (id: string, status: ValidationProgress['status'], passed?: boolean, details?: string) => {
    setValidationProgress(prev => prev.map(item => 
      item.id === id ? { ...item, status, passed, details } : item
    ));
  };

  const analyzeImage = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setValidationResults([]);
      initializeProgress();

      // 1. Local background check
      updateProgress('background', 'running');
      let localBgResult: ValidationResult | null = null;
      try {
        const img = await createImageBitmap(file);
        const bg = await validateSolidBackground(img);
        localBgResult = {
          id: 'background',
          label: 'Background is solid',
          passed: bg.isSolid,
          details: `Variance: ${Math.round(bg.score)}`,
          source: 'local',
        };
        updateProgress('background', 'completed', bg.isSolid, `Variance: ${Math.round(bg.score)}`);
      } catch (e) {
        localBgResult = {
          id: 'background',
          label: 'Background is solid',
          passed: false,
          details: 'Error running background check',
          source: 'local',
        };
        updateProgress('background', 'failed', false, 'Error running background check');
      }

      // 2. Posture validation
      updateProgress('posture', 'running');
      let postureResult: ValidationResult | null = null;
      try {
        const img = await createImageBitmap(file);
        const posture = await validateImagePosture(img);
        postureResult = {
          id: 'posture',
          label: 'Good posture (5-20° shoulder angle)',
          passed: posture.hasGoodPosture,
          details: posture.details,
          source: 'local',
        };
        updateProgress('posture', 'completed', posture.hasGoodPosture, posture.details);
      } catch (e) {
        console.error('Posture validation error:', e);
        postureResult = {
          id: 'posture',
          label: 'Good posture (5-20° shoulder angle)',
          passed: false,
          details: 'Error analyzing posture',
          source: 'local',
        };
        updateProgress('posture', 'failed', false, 'Error analyzing posture');
      }

      // Update validation results with background and posture
      const currentResults = [];
      if (localBgResult) currentResults.push(localBgResult);
      if (postureResult) currentResults.push(postureResult);
      setValidationResults(currentResults);

      // 3. Call edge function (Azure Face API)
      updateProgress('azure', 'running');
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
        body: { imageBase64: base64 }
      });
      if (error) throw new Error(error.message);
      
      updateProgress('azure', 'completed', data.isProfessionalHeadshot);

      // Inject background and posture results into AI analysis result
      let recommendations = data.details.recommendations ? [...data.details.recommendations] : [];
      
      // Add background recommendation if failed
      if (localBgResult && localBgResult.passed === false) {
        recommendations.unshift('Use a plain, solid-color background like a wall or curtain.');
      }
      
      // Add posture recommendation if failed
      if (postureResult && postureResult.passed === false) {
        recommendations.unshift('Stand or sit straight with shoulders at a slight angle (5-20°) to the camera.');
      }

      const mergedResult = {
        ...data,
        background: localBgResult ? {
          passed: localBgResult.passed,
          details: localBgResult.details,
        } : undefined,
        posture: postureResult ? {
          passed: postureResult.passed,
          shoulderAngle: postureResult.details.includes('angle:') ? 
            parseFloat(postureResult.details.match(/angle: ([\d.]+)°/)?.[1] || '0') : 0,
          details: postureResult.details,
        } : undefined,
        details: {
          ...data.details,
          recommendations,
        },
      };

      setAnalysisResult(mergedResult);
      return base64;

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
      updateProgress('azure', 'failed');
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

  const resetAnalysis = () => {
    setError(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setValidationResults([]);
    setValidationProgress([]);
  };

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
