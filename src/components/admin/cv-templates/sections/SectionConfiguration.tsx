
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CVSectionType } from '@/types/cv-templates';
import { DISPLAY_STYLES } from './SectionConstants';

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface SectionConfigurationProps {
  sectionId: string;
  sectionType: CVSectionType;
  displayStyle: string;
  projectsToView?: number;
  onUpdateSectionStyling: (id: string, styleUpdates: any) => void;
}

const SectionConfiguration: React.FC<SectionConfigurationProps> = ({
  sectionId,
  sectionType,
  displayStyle,
  projectsToView,
  onUpdateSectionStyling
}) => {
  const showProjectsToView = sectionType === 'projects';

  return (
    <div className="grid grid-cols-1 gap-2">
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
    </div>
  );
};

export default SectionConfiguration;
