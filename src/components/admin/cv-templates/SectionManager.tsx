import React, { useState, useEffect } from 'react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSectionFieldMappings } from '@/hooks/use-section-field-mappings';
import SortableSectionItem from './sections/SortableSectionItem';
import AddSectionPanel from './sections/AddSectionPanel';
import { SECTION_TYPES } from './sections/SectionConstants';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SectionManagerProps {
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
    projects_to_view?: number;
    fields?: FieldConfig[];
  };
}

const SectionManager: React.FC<SectionManagerProps> = ({ templateId, onSectionsChange }) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const { toast } = useToast();
  const { syncFieldMappings } = useSectionFieldMappings(templateId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
            projects_to_view: stylingConfig.projects_to_view || 3,
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

  const addSection = async (sectionType: CVSectionType) => {
    try {
      const defaultFields = await getDefaultFields(sectionType);
      
      const newSection = {
        template_id: templateId,
        section_type: sectionType,
        display_order: sections.length + 1,
        is_required: false,
        field_mapping: {},
        styling_config: {
          display_style: 'default',
          projects_to_view: sectionType === 'projects' ? 3 : undefined,
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
          projects_to_view: sectionType === 'projects' ? 3 : undefined,
          fields: defaultFields 
        }
      } as SectionConfig;

      setSections([...sections, typedSection]);
      setIsAddSectionOpen(false);
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

      const updatedSection = sections.find(s => s.id === id);
      if (updatedSection) {
        const newSection = { ...updatedSection, ...updates };
        setSections(sections.map(section => 
          section.id === id ? newSection : section
        ));

        // Sync field mappings when styling config is updated
        if (updates.styling_config?.fields) {
          await syncFieldMappings(id, updatedSection.section_type, updates.styling_config.fields);
        }
      }

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

  const updateSectionStyling = (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const updatedStylingConfig = {
      ...section.styling_config,
      ...styleUpdates
    };

    updateSection(id, { styling_config: updatedStylingConfig });
  };

  const updateFieldConfig = (sectionId: string, fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedFields = [...(section.styling_config.fields || [])];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...fieldUpdates };

    updateSectionStyling(sectionId, { fields: updatedFields });
  };

  const reorderFields = (sectionId: string, reorderedFields: FieldConfig[]) => {
    updateSectionStyling(sectionId, { fields: reorderedFields });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      newSections.forEach((section, idx) => {
        section.display_order = idx + 1;
      });

      setSections(newSections);

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
      } catch (error) {
        console.error('Error updating section order:', error);
        toast({
          title: "Error",
          description: "Failed to update section order",
          variant: "destructive"
        });
        loadSections();
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

  const availableSections = getAvailableSectionTypes();

  return (
    <div className="space-y-4">
      <AddSectionPanel
        isOpen={isAddSectionOpen}
        onOpenChange={setIsAddSectionOpen}
        availableSectionTypes={availableSections}
        onAddSection={addSection}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                expandedSections={expandedSections}
                onToggleExpanded={toggleSectionExpanded}
                onUpdateSection={updateSection}
                onUpdateSectionStyling={updateSectionStyling}
                onUpdateFieldConfig={updateFieldConfig}
                onReorderFields={reorderFields}
                onRemoveSection={removeSection}
                getSectionLabel={getSectionLabel}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && availableSections.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">All available sections have been added to your template.</p>
        </div>
      )}

      {sections.length === 0 && availableSections.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No sections added yet. Use the "Add Section" button above to add sections to your template.</p>
        </div>
      )}
    </div>
  );
};

export default SectionManager;
