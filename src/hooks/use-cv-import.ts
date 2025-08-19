
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';

export interface CVProcessResult {
  profileData: ProfileJSONData;
  confidence: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUri?: string;
}

export function useCVImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<CVProcessResult | null>(null);
  const { toast } = useToast();

  const processCV = async (file: File): Promise<CVProcessResult | null> => {
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

      const { data, error } = await supabase.functions.invoke('ai-cv-processor', {
        body: formData
      });

      if (error) {
        console.error('CV processing error:', error);
        toast({
          title: 'Processing Failed',
          description: 'Failed to process CV. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      if (!data?.profileData) {
        toast({
          title: 'Processing Failed',
          description: 'No profile data could be extracted from the CV.',
          variant: 'destructive'
        });
        return null;
      }

      const result = data as CVProcessResult;
      setProcessResult(result);

      toast({
        title: 'CV Processed',
        description: `Successfully extracted profile data from ${result.fileName}`,
      });

      return result;
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Processing Failed',
        description: 'An error occurred while processing the CV.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setProcessResult(null);
    setIsProcessing(false);
  };

  return {
    processCV,
    reset,
    isProcessing,
    processResult
  };
}
