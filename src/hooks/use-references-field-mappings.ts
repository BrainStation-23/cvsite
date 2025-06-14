
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldMapping {
  template_id: string;
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const useReferencesFieldMappings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createReferencesFieldMappings = useCallback(async (templateId: string) => {
    if (!templateId) return false;

    try {
      setIsLoading(true);

      // Define the default field mappings for references section
      const defaultFieldMappings: Omit<FieldMapping, 'id'>[] = [
        {
          template_id: templateId,
          original_field_name: 'name',
          display_name: 'Name',
          is_masked: false,
          field_order: 1,
          visibility_rules: { enabled: true },
          section_type: 'references'
        },
        {
          template_id: templateId,
          original_field_name: 'designation',
          display_name: 'Designation',
          is_masked: false,
          field_order: 2,
          visibility_rules: { enabled: true },
          section_type: 'references'
        },
        {
          template_id: templateId,
          original_field_name: 'company',
          display_name: 'Company',
          is_masked: false,
          field_order: 3,
          visibility_rules: { enabled: true },
          section_type: 'references'
        },
        {
          template_id: templateId,
          original_field_name: 'email',
          display_name: 'Email',
          is_masked: false,
          field_order: 4,
          visibility_rules: { enabled: true },
          section_type: 'references'
        }
      ];

      // Check if field mappings already exist for this template and section
      const { data: existingMappings } = await supabase
        .from('cv_template_field_mappings')
        .select('id')
        .eq('template_id', templateId)
        .eq('section_type', 'references');

      if (existingMappings && existingMappings.length > 0) {
        console.log('References field mappings already exist for this template');
        return true;
      }

      // Insert the field mappings
      const { error } = await supabase
        .from('cv_template_field_mappings')
        .insert(defaultFieldMappings);

      if (error) {
        console.error('Error creating references field mappings:', error);
        throw error;
      }

      console.log('Successfully created references field mappings for template:', templateId);
      
      toast({
        title: "Success",
        description: "References field mappings created successfully"
      });

      return true;
    } catch (error) {
      console.error('Error in createReferencesFieldMappings:', error);
      toast({
        title: "Error",
        description: "Failed to create references field mappings",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    createReferencesFieldMappings,
    isLoading
  };
};
