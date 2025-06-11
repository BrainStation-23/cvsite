
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CVSectionType } from '@/types/cv-templates';

const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];

interface SectionConfigurationProps {
  sectionId: string;
  sectionType: CVSectionType;
  displayStyle?: string;
  projectsToView?: number;
  maxSkillsCount?: number;
  onUpdateSectionStyling: (id: string, styleUpdates: any) => void;
}

const SectionConfiguration: React.FC<SectionConfigurationProps> = ({
  sectionId,
  sectionType,
  displayStyle,
  projectsToView,
  maxSkillsCount,
  onUpdateSectionStyling
}) => {
  const showProjectsToView = sectionType === 'projects';
  const showMaxSkillsCount = sectionType === 'technical_skills' || sectionType === 'specialized_skills';
  const showDisplayStyle = !showMaxSkillsCount; // Hide display style for skills sections

  return (
    <div className="grid grid-cols-1 gap-2">
      {showDisplayStyle && (
        <div>
          <Label className="text-xs">Display Style</Label>
          <Select 
            value={displayStyle || 'default'} 
            onValueChange={(value) => onUpdateSectionStyling(sectionId, { display_style: value })}
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
      )}

      {showProjectsToView && (
        <div>
          <Label className="text-xs">No of Projects</Label>
          <Input 
            type="number" 
            value={projectsToView || 3}
            onChange={(e) => onUpdateSectionStyling(sectionId, { projects_to_view: parseInt(e.target.value) })}
            min={1} 
            max={10} 
            className="h-7 text-xs" 
            placeholder="Max projects to show"
          />
        </div>
      )}

      {showMaxSkillsCount && (
        <div>
          <Label className="text-xs">Max Skills Count</Label>
          <Input 
            type="number" 
            value={maxSkillsCount || 10}
            onChange={(e) => onUpdateSectionStyling(sectionId, { max_skills_count: parseInt(e.target.value) })}
            min={1} 
            max={20} 
            className="h-7 text-xs" 
            placeholder="Max skills to show"
          />
        </div>
      )}
    </div>
  );
};

export default SectionConfiguration;
