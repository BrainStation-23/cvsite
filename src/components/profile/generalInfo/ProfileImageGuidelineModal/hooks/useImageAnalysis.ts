
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateSolidBackground } from '@/utils/imageBackgroundValidation';
import { ImageAnalysisResult, ValidationResult } from '../types';

export const useImageAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setValidationResults([]);

      // 1. Local background check
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
      } catch (e) {
        localBgResult = {
          id: 'background',
          label: 'Background is solid',
          passed: false,
          details: 'Error running background check',
          source: 'local',
        };
      }
      setValidationResults(localBgResult ? [localBgResult] : []);

      // 2. Call edge function (Azure)
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
      
      // Inject background result into AI analysis result
      let recommendations = data.details.recommendations ? [...data.details.recommendations] : [];
      if (localBgResult && localBgResult.passed === false) {
        recommendations.unshift('Use a plain, solid-color background like a wall or curtain.');
      }
      const mergedResult = {
        ...data,
        background: localBgResult ? {
          passed: localBgResult.passed,
          details: localBgResult.details,
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
  };

  return {
    analysisResult,
    isAnalyzing,
    validationResults,
    error,
    analyzeImage,
    resetAnalysis,
  };
};
