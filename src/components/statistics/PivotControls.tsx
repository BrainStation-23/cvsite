
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PivotControlsProps {
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

export const PivotControls: React.FC<PivotControlsProps> = ({
  primaryDimension,
  secondaryDimension,
  onPrimaryDimensionChange,
  onSecondaryDimensionChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pivot Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rows (Primary Dimension)</label>
            <Select value={primaryDimension} onValueChange={onPrimaryDimensionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIMENSION_OPTIONS.filter(option => option.value !== secondaryDimension).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Columns (Secondary Dimension)</label>
            <Select value={secondaryDimension} onValueChange={onSecondaryDimensionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIMENSION_OPTIONS.filter(option => option.value !== primaryDimension).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
