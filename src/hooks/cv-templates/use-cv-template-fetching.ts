
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CVTemplate } from '@/types/cv-templates';
import { useCVTemplateOperations } from './use-cv-template-operations';

export const useCVTemplateFetching = () => {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { convertSupabaseTemplate } = useCVTemplateOperations();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Supabase response to proper CVTemplate type
      const typedTemplates: CVTemplate[] = (data || []).map(convertSupabaseTemplate);
      
      setTemplates(typedTemplates);
    } catch (error) {
      console.error('Error fetching CV templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CV templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplate = async (id: string): Promise<CVTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert Supabase response to proper CVTemplate type
      const typedTemplate: CVTemplate = convertSupabaseTemplate(data);
      
      return typedTemplate;
    } catch (error) {
      console.error('Error fetching CV template:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    fetchTemplates,
    getTemplate,
    refetch: fetchTemplates
  };
};
