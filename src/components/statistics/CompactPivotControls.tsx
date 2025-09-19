
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompactPivotControlsProps {
  primaryDimension: string;
  secondaryDimension: string;
  onPrimaryDimensionChange: (dimension: string) => void;
  onSecondaryDimensionChange: (dimension: string) => void;
}

const DIMENSION_OPTIONS = [
  { value: 'sbu', label: 'SBU', description: 'Strategic Business Unit' },
  { value: 'resource_type', label: 'Resource Type', description: 'Type of resource allocation' },
  { value: 'bill_type', label: 'Bill Type', description: 'Billing classification' },
  { value: 'expertise', label: 'Expertise Type', description: 'Area of expertise' },
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

  const handleReset = () => {
    onPrimaryDimensionChange('sbu');
    onSecondaryDimensionChange('bill_type');
  };

  const getPrimaryOptions = () => DIMENSION_OPTIONS.filter(option => option.value !== secondaryDimension);
  const getSecondaryOptions = () => DIMENSION_OPTIONS.filter(option => option.value !== primaryDimension);

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Analysis Dimensions</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-xs"
            title="Reset to default dimensions"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Dimension Controls */}
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
        <div className="flex items-center gap-3 flex-1">
          <div className="space-y-1 min-w-0 flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rows
            </label>
            <Select value={primaryDimension || 'sbu'} onValueChange={onPrimaryDimensionChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getPrimaryOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapDimensions}
              className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary border border-dashed border-muted-foreground/30"
              title="Swap rows and columns"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Columns
            </label>
            <Select value={secondaryDimension || 'bill_type'} onValueChange={onSecondaryDimensionChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getSecondaryOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
