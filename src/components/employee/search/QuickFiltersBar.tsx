
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QuickFiltersBarProps {
  activeFilters: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
  totalResults?: number;
  filteredResults?: number;
}

const QuickFiltersBar: React.FC<QuickFiltersBarProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  totalResults,
  filteredResults
}) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Active Filters:
          </span>
          {activeFilters.slice(0, 5).map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {filter.label}
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onRemoveFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {activeFilters.length > 5 && (
            <Badge variant="outline">
              +{activeFilters.length - 5} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {totalResults !== undefined && filteredResults !== undefined && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredResults} of {totalResults} profiles
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onClearAllFilters}
            className="h-7"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickFiltersBar;
