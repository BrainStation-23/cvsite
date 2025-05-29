
import React, { useState, useEffect } from 'react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SectionAddForm from './sections/SectionAddForm';
import SectionItem from './sections/SectionItem';

interface EnhancedSectionManagerProps {
  templateId: string;
  onSectionsChange?: () => void;
}

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface SectionConfig {
  id: string;
  section_type: CVSectionType;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: {
    display_style?: string;
    items_per_column?: number;
    fields?: FieldConfig[];
  };
}

const SECTION_TYPES: { value: CVSectionType; label: string }[] = [
  { value: 'general', label: 'General Information' },
  { value: 'skills', label: 'Skills' },
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'specialized_skills', label: 'Specialized Skills' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'training', label: 'Training & Certifications' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'projects', label: 'Projects' },
];

const EnhancedSectionManager: React.FC<EnhancedSectionManagerProps> = ({ 
  templateId, 
  onSectionsChange 
}) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [newSectionType, setNewSectionType] = useState<CVSectionType>('skills');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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
        return {
          ...section,
          section_type: section.section_type as CVSectionType,
          field_mapping: section.field_mapping as Record<string, any> || {},
          styling_config: {
            display_style: stylingConfig.display_style || 'default',
            items_per_column: stylingConfig.items_per_column || 1,
            fields: (stylingConfig.fields as FieldConfig[]) || []
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

  const getDefaultFields = async (sectionType: CVSectionType): Promise<FieldConfig[]> => {
    try {
      const { data, error } = await supabase.rpc('get_default_fields_for_section', {
        section_type_param: sectionType
      });

      if (error) throw error;
      return (data as unknown as FieldConfig[]) || [];
    } catch (error) {
      console.error('Error getting default fields:', error);
      return [];
    }
  };

  const addSection = async () => {
    try {
      const defaultFields = await getDefaultFields(newSectionType);
      
      const newSection = {
        template_id: templateId,
        section_type: newSectionType,
        display_order: sections.length + 1,
        is_required: false,
        field_mapping: {},
        styling_config: {
          display_style: 'default',
          items_per_column: 1,
          fields: defaultFields
        }
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
        styling_config: { 
          display_style: 'default', 
          items_per_column: 1, 
          fields: defaultFields 
        }
      } as SectionConfig;

      setSections([...sections, typedSection]);
      onSectionsChange?.();
      
      toast({
        title: "Success",
        description: "Section added successfully"
      });
    } catch (error) {
      console.error('Error adding section:', error);
      toast({
        title: "Error",
        description: "Failed to add section",
        variant: "destructive"
      });
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
    } catch (error) {
      console.error('Error removing section:', error);
      toast({
        title: "Error",
        description: "Failed to remove section",
        variant: "destructive"
      });
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

      setSections(sections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      ));
      onSectionsChange?.();
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive"
      });
    }
  };

  const moveSection = async (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(section => section.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < sections.length - 1)) {
      const newSections = [...sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      
      newSections.forEach((section, idx) => {
        section.display_order = idx + 1;
      });
      
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

        setSections(newSections);
        onSectionsChange?.();
      } catch (error) {
        console.error('Error moving section:', error);
        toast({
          title: "Error",
          description: "Failed to move section",
          variant: "destructive"
        });
      }
    }
  };

  const getSectionLabel = (type: CVSectionType) => {
    return SECTION_TYPES.find(s => s.value === type)?.label || type;
  };

  const getAvailableSectionTypes = () => {
    const usedTypes = sections.map(s => s.section_type);
    return SECTION_TYPES.filter(type => !usedTypes.includes(type.value));
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

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading sections...</div>;
  }

  return (
    <div className="space-y-4">
      <SectionAddForm
        newSectionType={newSectionType}
        onSectionTypeChange={(value: CVSectionType) => setNewSectionType(value)}
        onAddSection={addSection}
        availableSectionTypes={getAvailableSectionTypes()}
      />

      <div className="space-y-3">
        {sections.map((section, index) => (
          <SectionItem
            key={section.id}
            section={section}
            index={index}
            isExpanded={expandedSections.has(section.id)}
            onToggleExpanded={() => toggleSectionExpanded(section.id)}
            onUpdateSection={(updates) => updateSection(section.id, updates)}
            onRemoveSection={() => removeSection(section.id)}
            onMoveSection={(direction) => moveSection(section.id, direction)}
            getSectionLabel={getSectionLabel}
          />
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No sections added yet. Use the form above to add sections to your template.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSectionManager;
