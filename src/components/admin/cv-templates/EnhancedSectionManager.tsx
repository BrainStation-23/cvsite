
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, Settings, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];

const EnhancedSectionManager: React.FC<EnhancedSectionManagerProps> = ({ templateId, onSectionsChange }) => {
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
      // Convert styling_config to proper format for database
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
    return <div>Loading sections...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Section Type</Label>
              <Select value={newSectionType} onValueChange={(value: CVSectionType) => setNewSectionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSectionTypes().map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSection} disabled={getAvailableSectionTypes().length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Template Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card key={section.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="h-4 w-8 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="h-4 w-8 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{getSectionLabel(section.section_type)}</h4>
                        <p className="text-sm text-gray-500">Order: {section.display_order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={section.is_required}
                          onCheckedChange={(checked) => updateSection(section.id, { is_required: checked })}
                        />
                        <Label className="text-sm">Required</Label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSectionExpanded(section.id)}
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSection(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Collapsible open={expandedSections.has(section.id)}>
                    <CollapsibleContent>
                      <div className="space-y-4 pt-4 border-t">
                        {/* Section Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Display Style</Label>
                            <Select 
                              value={section.styling_config.display_style || 'default'} 
                              onValueChange={(value) => updateSectionStyling(section.id, { display_style: value })}
                            >
                              <SelectTrigger className="h-8">
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
                            <Label className="text-sm">Items per Column</Label>
                            <Input 
                              type="number" 
                              value={section.styling_config.items_per_column || 1}
                              onChange={(e) => updateSectionStyling(section.id, { items_per_column: parseInt(e.target.value) })}
                              min={1} 
                              max={3} 
                              className="h-8" 
                            />
                          </div>
                        </div>

                        {/* Field Configuration */}
                        <div>
                          <Label className="text-sm font-medium mb-3 block">Field Configuration</Label>
                          <div className="space-y-3">
                            {(section.styling_config.fields || []).map((field, fieldIndex) => (
                              <div key={field.field} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={field.enabled}
                                      onCheckedChange={(checked) => updateFieldConfig(section.id, fieldIndex, { enabled: !!checked })}
                                    />
                                    <span className="font-medium text-sm">{field.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateFieldConfig(section.id, fieldIndex, { masked: !field.masked })}
                                      className="h-7 w-7 p-0"
                                    >
                                      {field.masked ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                
                                {field.masked && (
                                  <div className="mt-2">
                                    <Label className="text-xs">Mask Value</Label>
                                    <Input
                                      value={field.mask_value || ''}
                                      onChange={(e) => updateFieldConfig(section.id, fieldIndex, { mask_value: e.target.value })}
                                      placeholder="e.g., EMP-***"
                                      className="h-7 text-xs"
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
            ))}
          </div>

          {sections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No sections added yet. Use the form above to add sections to your template.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSectionManager;
