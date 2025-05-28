
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SectionManagerProps {
  templateId: string;
  onSectionsChange?: () => void;
}

interface SectionConfig {
  id: string;
  section_type: CVSectionType;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
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

const SectionManager: React.FC<SectionManagerProps> = ({ templateId, onSectionsChange }) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [newSectionType, setNewSectionType] = useState<CVSectionType>('skills');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

      setSections(data || []);
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

  const addSection = async () => {
    try {
      const newSection = {
        template_id: templateId,
        section_type: newSectionType,
        display_order: sections.length + 1,
        is_required: false,
        field_mapping: {},
        styling_config: {}
      };

      const { data, error } = await supabase
        .from('cv_template_sections')
        .insert([newSection])
        .select()
        .single();

      if (error) throw error;

      setSections([...sections, data]);
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
      const { error } = await supabase
        .from('cv_template_sections')
        .update(updates)
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
      
      // Update display orders
      newSections.forEach((section, idx) => {
        section.display_order = idx + 1;
      });
      
      try {
        // Update all sections with new display orders
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
              <div key={section.id} className="border rounded-lg p-4">
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
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
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

                {/* Section Configuration */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm">Display Style</Label>
                    <Select defaultValue="default">
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Items per Column</Label>
                    <Input type="number" defaultValue={1} min={1} max={3} className="h-8" />
                  </div>
                </div>
              </div>
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

export default SectionManager;
