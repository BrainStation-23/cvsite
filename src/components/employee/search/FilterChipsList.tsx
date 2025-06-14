
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Database } from 'lucide-react';
import { FilterChip } from './FilterState';

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
  // Group filters by table source for better organization
  const groupedFilters = activeFilters.reduce((acc, filter) => {
    const source = filter.tableSource || 'Other';
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(filter);
    return acc;
  }, {} as Record<string, FilterChip[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Active Filters ({activeFilters.length})
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAllFilters}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedFilters).map(([tableSource, filters]) => (
          <div key={tableSource} className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1">
              {tableSource}
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <span className="text-xs font-medium">{filter.label}:</span>
                  <span className="text-xs">{filter.value}</span>
                  <button
                    onClick={() => onRemoveFilter(filter.id)}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterChipsList;
