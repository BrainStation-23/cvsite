
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SectionControlsProps {
  maxSkillsCount?: number;
  projectsToView?: number;
  onMaxSkillsCountChange?: (value: number) => void;
  onProjectsToViewChange?: (value: number) => void;
  sectionType?: string;
}

const SectionControls: React.FC<SectionControlsProps> = ({
  maxSkillsCount,
  projectsToView,
  onMaxSkillsCountChange,
  onProjectsToViewChange,
  sectionType
}) => {
  const showProjectsToView = sectionType === 'projects' && onProjectsToViewChange;
  const showMaxSkillsCount = (sectionType === 'technical_skills' || sectionType === 'specialized_skills') && onMaxSkillsCountChange;

  if (!showProjectsToView && !showMaxSkillsCount) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {showProjectsToView && (
        <div>
          <Label className="text-xs">No of Projects</Label>
          <Input 
            type="number" 
            value={projectsToView || 3}
            onChange={(e) => onProjectsToViewChange!(parseInt(e.target.value))}
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
            onChange={(e) => onMaxSkillsCountChange!(parseInt(e.target.value))}
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

export default SectionControls;
