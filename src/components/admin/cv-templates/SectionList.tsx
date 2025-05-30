
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
}

interface SectionListProps {
  templateId: string;
  sections: TemplateSection[];
  onSectionDeleted: () => void;
  refetch: () => void;
}

const SectionList: React.FC<SectionListProps> = ({
  templateId,
  sections,
  onSectionDeleted,
  refetch
}) => {
  const { toast } = useToast();

  const getSectionLabel = (sectionType: string) => {
    const labels: Record<string, string> = {
      general: 'General Information',
      technical_skills: 'Technical Skills',
      specialized_skills: 'Specialized Skills',
      experience: 'Experience',
      education: 'Education',
      trainings: 'Trainings',
      achievements: 'Achievements',
      projects: 'Projects'
    };
    return labels[sectionType] || sectionType;
  };

  const handleDeleteSection = async (sectionId: string, sectionType: string) => {
    if (!confirm(`Are you sure you want to delete the "${getSectionLabel(sectionType)}" section?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cv_template_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Section "${getSectionLabel(sectionType)}" deleted successfully`,
      });

      onSectionDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  if (!sections || sections.length === 0) {
    return <div className="text-gray-500 text-center py-4">No sections added yet</div>;
  }

  return (
    <div className="space-y-2 mb-4">
      {sections.map((section) => (
        <div key={section.id} className="flex items-center justify-between p-3 border rounded">
          <div>
            <span className="font-medium">{getSectionLabel(section.section_type)}</span>
            <span className="text-sm text-gray-500 ml-2">(Order: {section.display_order})</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteSection(section.id, section.section_type)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SectionList;
