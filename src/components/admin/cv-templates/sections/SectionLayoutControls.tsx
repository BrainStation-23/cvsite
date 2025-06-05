
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SectionLayoutControlsProps {
  sectionId: string;
  currentPlacement: 'main' | 'sidebar';
  layoutType: string;
  onMoveSectionToPlacement?: (sectionId: string, placement: 'main' | 'sidebar') => void;
}

const SectionLayoutControls: React.FC<SectionLayoutControlsProps> = ({
  sectionId,
  currentPlacement,
  layoutType,
  onMoveSectionToPlacement
}) => {
  if (!onMoveSectionToPlacement) return null;

  return (
    <div>
      <Label className="text-xs">Column Placement</Label>
      <Select 
        value={currentPlacement} 
        onValueChange={(value: 'main' | 'sidebar') => onMoveSectionToPlacement(sectionId, value)}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">Main Column</SelectItem>
          <SelectItem value="sidebar">
            {layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column'}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SectionLayoutControls;
