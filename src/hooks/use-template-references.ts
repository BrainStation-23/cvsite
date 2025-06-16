
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reference {
  id: string;
  name: string;
  designation: string;
  company: string;
  email?: string;
  phone?: string;
}

export const useTemplateReferences = () => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('references')
        .select('*')
        .order('name');

      if (error) throw error;

      setReferences(data || []);
    } catch (error) {
      console.error('Error loading references:', error);
      toast({
        title: "Error",
        description: "Failed to load references",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    references,
    isLoading,
    loadReferences
  };
};
