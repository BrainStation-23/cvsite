
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilter {
  key: string;
  value: string | null;
  label: string;
}

interface FilterSummaryProps {
  activeFilters: ActiveFilter[];
  onReset: () => void;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({
  activeFilters,
  onReset
}) => {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-7 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className="px-2 py-1 text-xs"
          >
            <span className="font-medium">{filter.label}:</span>
            <span className="ml-1">{filter.value}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterSummary;
