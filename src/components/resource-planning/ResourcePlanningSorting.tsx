
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

  const getSortLabel = (column: string) => {
    switch (column) {
      case 'created_at': return 'Created Date';
      case 'profile.last_name': return 'Employee Name';
      case 'employee_id': return 'Employee ID';
      case 'engagement_percentage': return 'Engagement %';
      case 'billing_percentage': return 'Billing %';
      case 'bill_type': return 'Bill Type';
      case 'project': return 'Project';
      case 'engagement_start_date': return 'Start Date';
      case 'release_date': return 'Release Date';
      default: return column;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Sort by:</span>
      
      {/* Employee Information Group */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('profile.last_name')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Employee {getSortIcon('profile.last_name')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('employee_id')}
          className="flex items-center gap-1 h-7 px-2"
        >
          ID {getSortIcon('employee_id')}
        </Button>
      </div>

      {/* Engagement Information Group */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('engagement_percentage')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Eng % {getSortIcon('engagement_percentage')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('billing_percentage')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Bill % {getSortIcon('billing_percentage')}
        </Button>
      </div>

      {/* Project Information Group */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('bill_type')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Bill Type {getSortIcon('bill_type')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('project')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Project {getSortIcon('project')}
        </Button>
      </div>

      {/* Date Information Group */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('engagement_start_date')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Start {getSortIcon('engagement_start_date')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('release_date')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Release {getSortIcon('release_date')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSort('created_at')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Created {getSortIcon('created_at')}
        </Button>
      </div>

      {sortBy && (
        <Badge variant="secondary" className="ml-2">
          {getSortLabel(sortBy)}
          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
        </Badge>
      )}
    </div>
  );
};
