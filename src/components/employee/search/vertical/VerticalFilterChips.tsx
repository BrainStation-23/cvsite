
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter, Trash2 } from 'lucide-react';
import { FilterChip } from '../FilterState';

interface VerticalFilterChipsProps {
  activeFilters: FilterChip[];
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
  highlightedFilters?: string[];
}

const VerticalFilterChips: React.FC<VerticalFilterChipsProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  highlightedFilters = []
}) => {
  // Group filters by category for better organization
  const groupedFilters = activeFilters.reduce((acc, filter) => {
    const category = filter.tableSource || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(filter);
    return acc;
  }, {} as Record<string, FilterChip[]>);

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Active Filters ({activeFilters.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(groupedFilters).map(([category, filters]) => (
          <div key={category} className="space-y-2">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 border-b border-blue-200 dark:border-blue-700 pb-1">
              {category}
            </div>
            <div className="space-y-2">
              {filters.map((filter) => {
                const isHighlighted =
                  highlightedFilters.includes(filter.id) ||
                  highlightedFilters.includes(filter.type);
                
                return (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className={`w-full flex items-center justify-between px-3 py-2 bg-white text-blue-800 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700
                      ${isHighlighted ? 'border-2 border-purple-400 bg-purple-100 dark:bg-purple-700/40 animate-pulse' : ''}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{filter.label}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 truncate">{filter.value}</div>
                    </div>
                    <button
                      onClick={() => onRemoveFilter(filter.id)}
                      className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 flex-shrink-0"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VerticalFilterChips;
