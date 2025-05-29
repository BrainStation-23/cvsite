import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Trash2, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff,
  User,
  Code,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  FolderOpen,
  Target,
  GripVertical
} from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    items_per_column?: number;
    fields?: FieldConfig[];
  };
}

const SECTION_TYPES: { 
  value: CVSectionType; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { value: 'general', label: 'General Information', icon: User, description: 'Name, contact, bio' },
  { value: 'skills', label: 'Skills', icon: Target, description: 'General skills overview' },
  { value: 'technical_skills', label: 'Technical Skills', icon: Code, description: 'Programming, tools' },
  { value: 'specialized_skills', label: 'Specialized Skills', icon: Wrench, description: 'Domain expertise' },
  { value: 'experience', label: 'Work Experience', icon: Briefcase, description: 'Employment history' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Academic background' },
  { value: 'training', label: 'Training & Certifications', icon: Award, description: 'Courses, certificates' },
  { value: 'achievements', label: 'Achievements', icon: Trophy, description: 'Awards, recognition' },
  { value: 'projects', label: 'Projects', icon: FolderOpen, description: 'Portfolio work' },
];

const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];

interface SortableSectionItemProps {
  section: SectionConfig;
  index: number;
  expandedSections: Set<string>;
  onToggleExpanded: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<SectionConfig>) => void;
  onUpdateSectionStyling: (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => void;
  onUpdateFieldConfig: (sectionId: string, fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
  onRemoveSection: (id: string) => void;
  getSectionLabel: (type: CVSectionType) => string;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  expandedSections,
  onToggleExpanded,
  onUpdateSection,
  onUpdateSectionStyling,
  onUpdateFieldConfig,
  onRemoveSection,
  getSectionLabel
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{getSectionLabel(section.section_type)}</h4>
                <p className="text-xs text-gray-500">Order: {section.display_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleExpanded(section.id)}
                className="h-6 w-6 p-0"
              >
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveSection(section.id)}
                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Collapsible open={expandedSections.has(section.id)}>
            <CollapsibleContent>
              <div className="space-y-3 pt-2 border-t">
                {/* Section Configuration */}
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label className="text-xs">Display Style</Label>
                    <Select 
                      value={section.styling_config.display_style || 'default'} 
                      onValueChange={(value) => onUpdateSectionStyling(section.id, { display_style: value })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DISPLAY_STYLES.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Items per Column</Label>
                    <Input 
                      type="number" 
                      value={section.styling_config.items_per_column || 1}
                      onChange={(e) => onUpdateSectionStyling(section.id, { items_per_column: parseInt(e.target.value) })}
                      min={1} 
                      max={3} 
                      className="h-7 text-xs" 
                    />
                  </div>
                </div>

                {/* Field Configuration */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Fields</Label>
                  <div className="space-y-2">
                    {(section.styling_config.fields || []).map((field, fieldIndex) => (
                      <div key={field.field} className="border rounded p-2 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={field.enabled}
                              onCheckedChange={(checked) => onUpdateFieldConfig(section.id, fieldIndex, { enabled: !!checked })}
                            />
                            <span className="font-medium text-xs">{field.label}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateFieldConfig(section.id, fieldIndex, { masked: !field.masked })}
                            className="h-5 w-5 p-0"
                          >
                            {field.masked ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                          </Button>
                        </div>
                        
                        {field.masked && (
                          <div className="mt-1">
                            <Input
                              value={field.mask_value || ''}
                              onChange={(e) => onUpdateFieldConfig(section.id, fieldIndex, { mask_value: e.target.value })}
                              placeholder="e.g., EMP-***"
                              className="h-6 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

const SectionManager: React.FC<SectionManagerProps> = ({ templateId, onSectionsChange }) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      // Update display_order for all sections
      newSections.forEach((section, idx) => {
        section.display_order = idx + 1;
      });

      setSections(newSections);

      // Update database
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
        // Revert on error
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
      {/* Add New Section - Grid Layout */}
      {availableSections.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {availableSections.map(sectionType => {
                const Icon = sectionType.icon;
                return (
                  <Button
                    key={sectionType.value}
                    variant="outline"
                    onClick={() => addSection(sectionType.value)}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <Icon className="h-4 w-4 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{sectionType.label}</div>
                      <div className="text-xs text-gray-500">{sectionType.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Sections with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                index={index}
                expandedSections={expandedSections}
                onToggleExpanded={toggleSectionExpanded}
                onUpdateSection={updateSection}
                onUpdateSectionStyling={updateSectionStyling}
                onUpdateFieldConfig={updateFieldConfig}
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
          <p className="text-sm">No sections added yet. Use the buttons above to add sections to your template.</p>
        </div>
      )}
    </div>
  );
};

export default SectionManager;
