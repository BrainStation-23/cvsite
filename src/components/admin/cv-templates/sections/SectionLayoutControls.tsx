
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

  console.log('SectionLayoutControls render:', {
    sectionId,
    currentPlacement,
    layoutType
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Column Placement</Label>
      <Select 
        value={currentPlacement} 
        onValueChange={(value: 'main' | 'sidebar') => {
          console.log('Changing placement for section', sectionId, 'to', value);
          onMoveSectionToPlacement(sectionId, value);
        }}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">Main Column</SelectItem>
          <SelectItem value="sidebar">
            {layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column'}
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Choose which column this section appears in for {layoutType.includes('sidebar') ? 'sidebar' : 'two-column'} layouts
      </p>
    </div>
  );
};

export default SectionLayoutControls;
