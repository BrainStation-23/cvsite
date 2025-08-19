
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';

export interface CVUploadResult {
  extractedText: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface CVAnalysisResult {
  profileData: ProfileJSONData;
  confidence: string;
  extractedText: string;
}

export function useCVImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<CVUploadResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const { toast } = useToast();

  const uploadAndParseCV = async (file: File): Promise<CVUploadResult | null> => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return null;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF, DOCX, or TXT file',
        variant: 'destructive'
      });
      return null;
    }

    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('ai-cv-parser', {
        body: formData
      });

      if (error) {
        console.error('File parsing error:', error);
        toast({
          title: 'Parsing Failed',
          description: 'Failed to extract text from the file. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      if (!data?.extractedText) {
        toast({
          title: 'Parsing Failed',
          description: 'No text could be extracted from the file.',
          variant: 'destructive'
        });
        return null;
      }

      const result = data as CVUploadResult;
      setUploadResult(result);

      toast({
        title: 'File Parsed',
        description: `Successfully extracted ${result.extractedText.length} characters from ${result.fileName}`,
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while processing the file.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeCV = async (extractedText: string): Promise<CVAnalysisResult | null> => {
    if (!extractedText) {
      toast({
        title: 'Error',
        description: 'No text to analyze',
        variant: 'destructive'
      });
      return null;
    }

    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke('ai-cv-analyzer', {
        body: { extractedText }
      });

      if (error) {
        console.error('CV analysis error:', error);
        toast({
          title: 'Analysis Failed',
          description: 'Failed to analyze CV with AI. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      if (!data?.profileData) {
        toast({
          title: 'Analysis Failed',
          description: 'AI could not extract profile data from the CV.',
          variant: 'destructive'
        });
        return null;
      }

      const result = data as CVAnalysisResult;
      setAnalysisResult(result);

      toast({
        title: 'CV Analyzed',
        description: `Successfully extracted profile data with ${result.confidence} confidence`,
      });

      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing the CV.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setUploadResult(null);
    setAnalysisResult(null);
    setIsProcessing(false);
  };

  return {
    uploadAndParseCV,
    analyzeCV,
    reset,
    isProcessing,
    uploadResult,
    analysisResult
  };
}
