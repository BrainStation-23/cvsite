
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateSolidBackground } from '@/utils/imageValidation/imageBackgroundValidation';
import { validateImagePosture } from '@/utils/imageValidation/imagePostureValidation';
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
      {
        id: 'azure',
        label: 'Verifying facial features and composition',
        status: 'pending',
        subtasks: [
          { id: 'not_group', label: 'Not a group photo', status: 'pending' },
          { id: 'face_centered', label: 'Face is centered', status: 'pending' },
          { id: 'no_accessories', label: 'No sunglasses or hat', status: 'pending' },
        ]
      },
    ];
    setValidationProgress(initialProgress);
  };

  const updateProgress = (
    id: string,
    status: ValidationProgress['status'],
    passed?: boolean,
    details?: string,
    subtaskId?: string
  ) => {
    setValidationProgress(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        // If subtaskId is provided, update only the subtask
        if (subtaskId && item.subtasks) {
          return {
            ...item,
            subtasks: item.subtasks.map(sub =>
              sub.id === subtaskId
                ? { ...sub, status, passed, details }
                : sub
            )
          };
        }
        // Otherwise, update the main item
        return { ...item, status, passed, details };
      })
    );
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
      
      // Update subtasks for facial features and composition
      updateProgress(
        'azure',
        'completed',
        data.isNotGroupPhoto,
        undefined,
        'not_group'
      );
      updateProgress(
        'azure',
        'completed',
        data.isFaceCentered,
        undefined,
        'face_centered'
      );
      updateProgress(
        'azure',
        'completed',
        data.hasNoSunglassesOrHats,
        undefined,
        'no_accessories'
      );
      // Mark main azure task as completed if all subtasks pass
      const allAzurePassed = data.isNotGroupPhoto && data.isFaceCentered && data.hasNoSunglassesOrHats;
      updateProgress('azure', 'completed', allAzurePassed);

      // Build recommendations based on failed requirements
      const recommendations: string[] = [];
      if (localBgResult && localBgResult.passed === false) {
        recommendations.push('Use a plain, solid-color background like a wall or curtain.');
      }
      if (postureResult && postureResult.passed === false) {
        recommendations.push('Stand or sit straight with shoulders at a slight angle (5-20°) to the camera.');
      }
      if (!data.isNotGroupPhoto) {
        recommendations.push('Make sure the photo contains only you (no group photos).');
      }
      if (!data.isFaceCentered) {
        recommendations.push('Center your face in the frame for best results.');
      }
      if (!data.hasNoSunglassesOrHats) {
        recommendations.push('Remove sunglasses, hats, or any accessories covering your face.');
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
