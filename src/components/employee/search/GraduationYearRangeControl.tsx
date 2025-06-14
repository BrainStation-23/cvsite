
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GraduationYearRangeControlProps {
  minYear: number | null;
  maxYear: number | null;
  onMinYearChange: (year: number | null) => void;
  onMaxYearChange: (year: number | null) => void;
}

const GraduationYearRangeControl: React.FC<GraduationYearRangeControlProps> = ({
  minYear,
  maxYear,
  onMinYearChange,
  onMaxYearChange
}) => {
  const currentYear = new Date().getFullYear();
  const minValidYear = 1950;
  const maxValidYear = currentYear + 10;

  const handleMinYearChange = (value: string) => {
    if (value === '') {
      onMinYearChange(null);
      return;
    }
    
    const year = parseInt(value);
    if (!isNaN(year) && year >= minValidYear && year <= maxValidYear) {
      onMinYearChange(year);
    }
  };

  const handleMaxYearChange = (value: string) => {
    if (value === '') {
      onMaxYearChange(null);
      return;
    }
    
    const year = parseInt(value);
    if (!isNaN(year) && year >= minValidYear && year <= maxValidYear) {
      onMaxYearChange(year);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="graduation-year-range" className="text-sm font-medium">
          Graduation Year Range
        </Label>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="From year"
              value={minYear || ''}
              onChange={(e) => handleMinYearChange(e.target.value)}
              min={minValidYear}
              max={maxValidYear}
              className="text-sm"
            />
          </div>
          <span className="text-sm text-gray-500">to</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="To year"
              value={maxYear || ''}
              onChange={(e) => handleMaxYearChange(e.target.value)}
              min={minValidYear}
              max={maxValidYear}
              className="text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter graduation years between {minValidYear} and {maxValidYear}
        </p>
      </div>
    </div>
  );
};

export default GraduationYearRangeControl;
