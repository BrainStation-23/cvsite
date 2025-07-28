
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAiEnhance() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const enhanceText = async (originalContent: string, requirements: string): Promise<string | null> => {
    if (!originalContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide some content to enhance',
        variant: 'destructive'
      });
      return null;
    }

    try {
      setIsEnhancing(true);

      const { data, error } = await supabase.functions.invoke('ai-enhance-rewrite', {
        body: {
          originalContent,
          requirements
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        toast({
          title: 'Enhancement Failed',
          description: 'Failed to enhance text. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      if (!data?.enhancedText) {
        toast({
          title: 'Enhancement Failed',
          description: 'No enhanced text received. Please try again.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Text Enhanced',
        description: 'Your text has been successfully enhanced!',
      });

      return data.enhancedText;
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: 'Enhancement Failed',
        description: 'An error occurred while enhancing the text.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    enhanceText,
    isEnhancing
  };
}
