
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSectionFieldMappings } from '@/hooks/use-section-field-mappings';
import { SectionConfig } from './use-template-sections';

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

export const useSectionOperations = (
  templateId: string,
  sections: SectionConfig[],
  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>,
  onSectionsChange?: () => void
) => {
  const { toast } = useToast();
  const { syncFieldMappings } = useSectionFieldMappings(templateId);

  const getDefaultFields = async (sectionType: CVSectionType): Promise<FieldConfig[]> => {
    // Page break sections don't have fields
    if (sectionType === 'page_break') {
      return [];
    }

    // References section has its own default fields
    if (sectionType === 'references') {
      return [
        { field: 'name', label: 'Name', enabled: true, masked: false, order: 1 },
        { field: 'designation', label: 'Designation', enabled: true, masked: false, order: 2 },
        { field: 'company', label: 'Company', enabled: true, masked: false, order: 3 },
        { field: 'email', label: 'Email', enabled: true, masked: false, order: 4 }
      ];
    }

    try {
      const { data, error } = await supabase.rpc('get_section_fields', {
        section_type_param: sectionType
      });

      if (error) throw error;
      
      return (data || []).map((field: any) => ({
        field: field.field_name,
        label: field.display_label,
        enabled: field.default_enabled,
        masked: field.default_masked,
        mask_value: field.default_mask_value,
        order: field.default_order
      }));
    } catch (error) {
      console.error('Error getting default fields:', error);
      return [];
    }
  };

  const addSection = async (
    sectionType: CVSectionType, 
    isMultiColumnLayout: boolean,
    defaultSidebarSections: CVSectionType[] = []
  ) => {
    try {
      const defaultFields = await getDefaultFields(sectionType);
      
      // Determine default placement for new sections
      let defaultPlacement: 'main' | 'sidebar' = 'main';
      if (isMultiColumnLayout) {
        defaultPlacement = defaultSidebarSections.includes(sectionType) ? 'sidebar' : 'main';
      }
      
      // Set default styling config based on section type
      let defaultStylingConfig: any = {
        layout_placement: defaultPlacement,
        fields: defaultFields
      };

      if (sectionType === 'projects') {
        defaultStylingConfig.projects_to_view = 3;
      } else if (sectionType === 'technical_skills' || sectionType === 'specialized_skills') {
        defaultStylingConfig.max_skills_count = 10;
      } else if (sectionType !== 'page_break') {
        defaultStylingConfig.display_style = 'default';
      }
      
      const newSection = {
        template_id: templateId,
        section_type: sectionType,
        display_order: sections.length + 1,
        is_required: false,
        field_mapping: {},
        styling_config: sectionType === 'page_break' ? {} : defaultStylingConfig
      };

      const { data, error } = await supabase
        .from('cv_template_sections')
        .insert([{
          ...newSection,
          styling_config: newSection.styling_config as any
        }])
        .select()
        .single();

      if (error) throw error;

      const typedSection = {
        ...data,
        section_type: data.section_type as CVSectionType,
        field_mapping: data.field_mapping as Record<string, any> || {},
        styling_config: defaultStylingConfig
      } as SectionConfig;

      setSections([...sections, typedSection]);
      onSectionsChange?.();
      
      toast({
        title: "Success",
        description: "Section added successfully"
      });
      
      return typedSection;
    } catch (error) {
      console.error('Error adding section:', error);
      toast({
        title: "Error",
        description: "Failed to add section",
        variant: "destructive"
      });
      return null;
    }
  };

  const removeSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cv_template_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSections(sections.filter(section => section.id !== id));
      onSectionsChange?.();
      
      toast({
        title: "Success",
        description: "Section removed successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error removing section:', error);
      toast({
        title: "Error",
        description: "Failed to remove section",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateSection = async (id: string, updates: Partial<SectionConfig>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.styling_config) {
        dbUpdates.styling_config = updates.styling_config as any;
      }

      const { error } = await supabase
        .from('cv_template_sections')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedSection = sections.find(s => s.id === id);
      if (updatedSection) {
        const newSection = { ...updatedSection, ...updates };
        setSections(sections.map(section => 
          section.id === id ? newSection : section
        ));

        // Sync field mappings when styling config is updated (but not for page breaks)
        if (updates.styling_config?.fields && updatedSection.section_type !== 'page_break') {
          await syncFieldMappings(id, updatedSection.section_type, updates.styling_config.fields);
        }
      }

      onSectionsChange?.();
      return true;
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateSectionStyling = (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const updatedStylingConfig = {
      ...section.styling_config,
      ...styleUpdates
    };

    return updateSection(id, { styling_config: updatedStylingConfig });
  };

  const updateFieldConfig = (sectionId: string, fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedFields = [...(section.styling_config.fields || [])];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...fieldUpdates };

    return updateSectionStyling(sectionId, { fields: updatedFields });
  };

  const reorderFields = (sectionId: string, reorderedFields: FieldConfig[]) => {
    return updateSectionStyling(sectionId, { fields: reorderedFields });
  };

  const moveSectionToPlacement = (sectionId: string, newPlacement: 'main' | 'sidebar') => {
    return updateSectionStyling(sectionId, { layout_placement: newPlacement });
  };

  const updateSectionsOrder = async (newSections: SectionConfig[]) => {
    try {
      const updates = newSections.map(section => ({
        id: section.id,
        display_order: section.display_order
      }));

      for (const update of updates) {
        await supabase
          .from('cv_template_sections')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      onSectionsChange?.();
      return true;
    } catch (error) {
      console.error('Error updating section order:', error);
      toast({
        title: "Error",
        description: "Failed to update section order",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    addSection,
    removeSection,
    updateSection,
    updateSectionStyling,
    updateFieldConfig,
    reorderFields,
    moveSectionToPlacement,
    updateSectionsOrder,
    getDefaultFields
  };
};
