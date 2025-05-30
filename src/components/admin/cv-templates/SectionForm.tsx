
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SectionFormProps {
  templateId: string;
  onSectionCreated: () => void;
  onCancel: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({
  templateId,
  onSectionCreated,
  onCancel
}) => {
  const [sectionType, setSectionType] = useState('general');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionType) {
      toast({
        title: "Error",
        description: "Section type is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase
        .from('cv_template_sections')
        .insert({
          template_id: templateId,
          section_type: sectionType,
          display_order: 999,
          is_required: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section created successfully",
      });

      onSectionCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Section</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={sectionType} onValueChange={setSectionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select section type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Information</SelectItem>
              <SelectItem value="technical_skills">Technical Skills</SelectItem>
              <SelectItem value="specialized_skills">Specialized Skills</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="trainings">Trainings</SelectItem>
              <SelectItem value="achievements">Achievements</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Section'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionForm;
