
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldMapping {
  id?: string;
  template_id: string;
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const useSectionFieldMappings = (templateId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const syncFieldMappings = useCallback(async (sectionId: string, sectionType: string, fields: any[]) => {
    if (!templateId || !fields || fields.length === 0) return;

    try {
      setIsLoading(true);

      // First, delete existing field mappings for this section
      await supabase
        .from('cv_template_field_mappings')
        .delete()
        .eq('template_id', templateId)
        .eq('section_type', sectionType);

      // Create new field mappings
      const fieldMappings: Omit<FieldMapping, 'id'>[] = fields.map((field, index) => ({
        template_id: templateId,
        original_field_name: field.field,
        display_name: field.label,
        is_masked: field.masked || false,
        mask_value: field.mask_value || null,
        field_order: field.order || index + 1,
        visibility_rules: { enabled: field.enabled },
        section_type: sectionType
      }));

      if (fieldMappings.length > 0) {
        const { error } = await supabase
          .from('cv_template_field_mappings')
          .insert(fieldMappings);

        if (error) throw error;
      }

      console.log(`Synced ${fieldMappings.length} field mappings for section ${sectionType}`);
    } catch (error) {
      console.error('Error syncing field mappings:', error);
      toast({
        title: "Error",
        description: "Failed to sync field mappings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [templateId, toast]);

  return {
    syncFieldMappings,
    isLoading
  };
};
