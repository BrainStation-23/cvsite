
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompactPivotControlsProps {
  primaryDimension: string;
  secondaryDimension: string;
  onPrimaryDimensionChange: (dimension: string) => void;
  onSecondaryDimensionChange: (dimension: string) => void;
}

const DIMENSION_OPTIONS = [
  { value: 'sbu', label: 'SBU' },
  { value: 'resource_type', label: 'Resource Type' },
  { value: 'bill_type', label: 'Bill Type' },
  { value: 'expertise', label: 'Expertise Type' },
];

export const CompactPivotControls: React.FC<CompactPivotControlsProps> = ({
  primaryDimension,
  secondaryDimension,
  onPrimaryDimensionChange,
  onSecondaryDimensionChange,
}) => {
  const handleSwapDimensions = () => {
    onPrimaryDimensionChange(secondaryDimension);
    onSecondaryDimensionChange(primaryDimension);
  };

  const getPrimaryOptions = () => DIMENSION_OPTIONS.filter(option => option.value !== secondaryDimension);
  const getSecondaryOptions = () => DIMENSION_OPTIONS.filter(option => option.value !== primaryDimension);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Rows:</span>
        <Select value={primaryDimension} onValueChange={onPrimaryDimensionChange}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getPrimaryOptions().map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSwapDimensions}
        className="h-8 w-8 p-0 hover:bg-muted"
        title="Swap rows and columns"
      >
        <ArrowRightLeft className="h-3 w-3" />
      </Button>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Columns:</span>
        <Select value={secondaryDimension} onValueChange={onSecondaryDimensionChange}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getSecondaryOptions().map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
