
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Clock, X } from 'lucide-react';

interface ExperienceYearsFilterProps {
  minYears: number | null;
  maxYears: number | null;
  onFilterChange: (min: number | null, max: number | null) => void;
  onClear: () => void;
}

const ExperienceYearsFilter: React.FC<ExperienceYearsFilterProps> = ({
  minYears,
  maxYears,
  onFilterChange,
  onClear
}) => {
  const [localMin, setLocalMin] = useState<string>(minYears?.toString() || '');
  const [localMax, setLocalMax] = useState<string>(maxYears?.toString() || '');
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    const min = localMin ? parseInt(localMin, 10) : null;
    const max = localMax ? parseInt(localMax, 10) : null;
    
    if (min !== null && max !== null && min > max) {
      return; // Don't apply if min > max
    }
    
    onFilterChange(min, max);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onClear();
    setIsOpen(false);
  };

  const hasFilter = minYears !== null || maxYears !== null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilter ? "default" : "outline"} 
          size="sm"
          className="h-8 gap-2"
        >
          <Clock className="h-4 w-4" />
          Experience Years
          {hasFilter && (
            <X 
              className="h-3 w-3 ml-1" 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter by Experience Years</h4>
            <p className="text-sm text-muted-foreground">
              Filter employees by their total years of experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-years">Min Years</Label>
              <Input
                id="min-years"
                type="number"
                placeholder="0"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                min="0"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-years">Max Years</Label>
              <Input
                id="max-years"
                type="number"
                placeholder="50"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                min="0"
                max="50"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm" className="flex-1">
              Apply Filter
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExperienceYearsFilter;
