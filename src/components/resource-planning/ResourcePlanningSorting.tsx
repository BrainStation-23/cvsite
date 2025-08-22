
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
    console.log('ResourcePlanningSorting - handleSort called:', { column, currentSortBy: sortBy, currentSortOrder: sortOrder });
    
    if (sortBy === column) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      console.log('ResourcePlanningSorting - Toggling sort order:', newOrder);
      setSortOrder(newOrder);
    } else {
      console.log('ResourcePlanningSorting - Setting new sort column:', column);
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

  const getButtonVariant = (column: string) => {
    return sortBy === column ? 'default' : 'ghost';
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Sort by:</span>
      
      {/* Employee Information Group */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
        <Button
          variant={getButtonVariant('profile.last_name')}
          size="sm"
          onClick={() => handleSort('profile.last_name')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Employee {getSortIcon('profile.last_name')}
        </Button>
        <Button
          variant={getButtonVariant('employee_id')}
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
          variant={getButtonVariant('engagement_percentage')}
          size="sm"
          onClick={() => handleSort('engagement_percentage')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Eng % {getSortIcon('engagement_percentage')}
        </Button>
        <Button
          variant={getButtonVariant('billing_percentage')}
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
          variant={getButtonVariant('bill_type')}
          size="sm"
          onClick={() => handleSort('bill_type')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Bill Type {getSortIcon('bill_type')}
        </Button>
        <Button
          variant={getButtonVariant('project')}
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
          variant={getButtonVariant('engagement_start_date')}
          size="sm"
          onClick={() => handleSort('engagement_start_date')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Start {getSortIcon('engagement_start_date')}
        </Button>
        <Button
          variant={getButtonVariant('release_date')}
          size="sm"
          onClick={() => handleSort('release_date')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Release {getSortIcon('release_date')}
        </Button>
        <Button
          variant={getButtonVariant('created_at')}
          size="sm"
          onClick={() => handleSort('created_at')}
          className="flex items-center gap-1 h-7 px-2"
        >
          Created {getSortIcon('created_at')}
        </Button>
      </div>

      {sortBy && (
        <Badge variant="secondary" className="ml-2">
          Currently: {getSortLabel(sortBy)}
          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
        </Badge>
      )}
    </div>
  );
};
