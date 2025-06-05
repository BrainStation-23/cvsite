
import { useState, useEffect } from 'react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

export interface SectionConfig {
  id: string;
  section_type: CVSectionType;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: {
    display_style?: string;
    projects_to_view?: number;
    fields?: FieldConfig[];
    layout_placement?: 'main' | 'sidebar';
  };
}

export const useTemplateSections = (
  templateId: string,
  layoutType: string,
  onSectionsChange?: () => void,
  defaultSidebarSections: CVSectionType[] = []
) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const { toast } = useToast();

  const isMultiColumnLayout = ['two-column', 'sidebar-left', 'sidebar-right'].includes(layoutType);

  useEffect(() => {
    loadSections();
  }, [templateId]);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_template_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;

      const typedSections = (data || []).map(section => {
        const stylingConfig = section.styling_config as any || {};
        
        // Determine layout placement based on section type and layout config
        let layoutPlacement: 'main' | 'sidebar' = 'main';
        if (isMultiColumnLayout) {
          layoutPlacement = stylingConfig.layout_placement || 
            (defaultSidebarSections.includes(section.section_type as CVSectionType) ? 'sidebar' : 'main');
        }

        return {
          ...section,
          section_type: section.section_type as CVSectionType,
          field_mapping: section.field_mapping as Record<string, any> || {},
          styling_config: {
            display_style: stylingConfig.display_style || 'default',
            projects_to_view: stylingConfig.projects_to_view || 3,
            fields: (stylingConfig.fields as FieldConfig[]) || [],
            layout_placement: layoutPlacement
          }
        } as SectionConfig;
      });

      setSections(typedSections);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast({
        title: "Error",
        description: "Failed to load template sections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const groupedSections = () => {
    if (!isMultiColumnLayout) {
      return { all: sections };
    }

    const mainSections = sections.filter(s => s.styling_config.layout_placement === 'main');
    const sidebarSections = sections.filter(s => s.styling_config.layout_placement === 'sidebar');

    return { main: mainSections, sidebar: sidebarSections };
  };

  return {
    sections,
    setSections,
    isLoading,
    expandedSections,
    isAddSectionOpen,
    setIsAddSectionOpen,
    toggleSectionExpanded,
    groupedSections,
    loadSections,
    templateId,
    isMultiColumnLayout
  };
};
