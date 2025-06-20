
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  id: string;
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const useTemplateConfiguration = (templateId: string) => {
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguration = useCallback(async () => {
    if (!templateId) return;
    
    try {
      setIsLoading(true);

      // Fetch template sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('cv_template_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      // Fetch field mappings
      const { data: fieldMappingsData, error: fieldMappingsError } = await supabase
        .from('cv_template_field_mappings')
        .select('*')
        .eq('template_id', templateId)
        .order('field_order');

      console.log('[DEBUG] Raw fieldMappingsData from Supabase:', fieldMappingsData);

      if (fieldMappingsError) throw fieldMappingsError;

      // Cast Json types to Record<string, any> to match our interfaces
      const processedSections = (sectionsData || []).map(section => ({
        ...section,
        field_mapping: section.field_mapping as Record<string, any>,
        styling_config: section.styling_config as Record<string, any>
      }));

      const processedFieldMappings = (fieldMappingsData || []).map(mapping => ({
        ...mapping,
        visibility_rules: mapping.visibility_rules as Record<string, any>
      }));

      console.log('[DEBUG] Processed fieldMappings (after mapping):', processedFieldMappings);

      setSections(processedSections);
      setFieldMappings(processedFieldMappings);

      console.log('Template configuration loaded:', {
        sectionsCount: processedSections.length,
        fieldMappingsCount: processedFieldMappings.length
      });
    } catch (error) {
      console.error('Error fetching template configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load template configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [templateId, toast]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  return {
    sections,
    fieldMappings,
    isLoading,
    refetch: fetchConfiguration
  };
};
