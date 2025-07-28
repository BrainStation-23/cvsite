
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResourcePlanningSortingProps {
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export const ResourcePlanningSorting: React.FC<ResourcePlanningSortingProps> = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Sort by:</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort('created_at')}
        className="flex items-center gap-1"
      >
        Created Date {getSortIcon('created_at')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort('profile.last_name')}
        className="flex items-center gap-1"
      >
        Employee {getSortIcon('profile.last_name')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort('engagement_percentage')}
        className="flex items-center gap-1"
      >
        Engagement % {getSortIcon('engagement_percentage')}
      </Button>
      {sortBy && (
        <Badge variant="secondary" className="ml-2">
          {sortBy === 'created_at' ? 'Created Date' : 
           sortBy === 'profile.last_name' ? 'Employee' : 
           sortBy === 'engagement_percentage' ? 'Engagement %' : sortBy}
          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
        </Badge>
      )}
    </div>
  );
};
