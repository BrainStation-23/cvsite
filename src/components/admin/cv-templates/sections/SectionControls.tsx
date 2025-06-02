
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SectionControlsProps {
  displayStyle: string;
  itemsPerColumn?: number;
  projectsToView?: number;
  onDisplayStyleChange: (value: string) => void;
  onItemsPerColumnChange?: (value: number) => void;
  onProjectsToViewChange?: (value: number) => void;
  sectionType?: string;
}

const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];

const SectionControls: React.FC<SectionControlsProps> = ({
  displayStyle,
  itemsPerColumn,
  projectsToView,
  onDisplayStyleChange,
  onItemsPerColumnChange,
  onProjectsToViewChange,
  sectionType
}) => {
  // Don't show items per column for general section and projects section
  const showItemsPerColumn = sectionType !== 'general' && sectionType !== 'projects' && onItemsPerColumnChange;
  const showProjectsToView = sectionType === 'projects' && onProjectsToViewChange;

  return (
    <div className="grid grid-cols-1 gap-2">
      <div>
        <Label className="text-xs">Display Style</Label>
        <Select value={displayStyle} onValueChange={onDisplayStyleChange}>
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
      
      {showItemsPerColumn && (
        <div>
          <Label className="text-xs">Items per Column</Label>
          <Input 
            type="number" 
            value={itemsPerColumn || 1}
            onChange={(e) => onItemsPerColumnChange!(parseInt(e.target.value))}
            min={1} 
            max={3} 
            className="h-7 text-xs" 
          />
        </div>
      )}

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
    </div>
  );
};

export default SectionControls;
