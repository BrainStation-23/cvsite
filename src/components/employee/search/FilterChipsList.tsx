
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trash } from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: string;
}

interface FilterChipsListProps {
  activeFilters: FilterChip[];
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
}

const FilterChipsList: React.FC<FilterChipsListProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAllFilters
}) => {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1"
        >
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="ml-1 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearAllFilters}
        className="h-7 px-3 text-xs"
      >
        <Trash className="h-3 w-3 mr-1" />
        Clear All
      </Button>
    </div>
  );
};

export default FilterChipsList;
