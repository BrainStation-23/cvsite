
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
    // Allow empty input
    if (value === '') {
      onMinYearChange(null);
      return;
    }
    
    // Allow partial typing (1-4 digits)
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 4) {
      // Only validate and set if it's a complete 4-digit year
      if (numericValue.length === 4) {
        const year = parseInt(numericValue);
        if (year >= minValidYear && year <= maxValidYear) {
          onMinYearChange(year);
        }
      }
      // For partial inputs (1-3 digits), we don't call onMinYearChange
      // but we allow the typing to continue
    }
  };

  const handleMaxYearChange = (value: string) => {
    // Allow empty input
    if (value === '') {
      onMaxYearChange(null);
      return;
    }
    
    // Allow partial typing (1-4 digits)
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 4) {
      // Only validate and set if it's a complete 4-digit year
      if (numericValue.length === 4) {
        const year = parseInt(numericValue);
        if (year >= minValidYear && year <= maxValidYear) {
          onMaxYearChange(year);
        }
      }
      // For partial inputs (1-3 digits), we don't call onMaxYearChange
      // but we allow the typing to continue
    }
  };

  const handleMinYearBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onMinYearChange(null);
      return;
    }
    
    const year = parseInt(value);
    if (!isNaN(year) && year >= minValidYear && year <= maxValidYear) {
      onMinYearChange(year);
    } else {
      // Reset to previous valid value or null
      e.target.value = minYear ? minYear.toString() : '';
    }
  };

  const handleMaxYearBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onMaxYearChange(null);
      return;
    }
    
    const year = parseInt(value);
    if (!isNaN(year) && year >= minValidYear && year <= maxValidYear) {
      onMaxYearChange(year);
    } else {
      // Reset to previous valid value or null
      e.target.value = maxYear ? maxYear.toString() : '';
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
              type="text"
              placeholder="From year"
              defaultValue={minYear || ''}
              onChange={(e) => handleMinYearChange(e.target.value)}
              onBlur={handleMinYearBlur}
              className="text-sm"
              maxLength={4}
            />
          </div>
          <span className="text-sm text-gray-500">to</span>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="To year"
              defaultValue={maxYear || ''}
              onChange={(e) => handleMaxYearChange(e.target.value)}
              onBlur={handleMaxYearBlur}
              className="text-sm"
              maxLength={4}
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
