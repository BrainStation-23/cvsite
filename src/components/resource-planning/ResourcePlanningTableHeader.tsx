
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ResourcePlanningTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  // Bulk selection props
  showBulkSelection?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: (checked: boolean) => void;
}

export const ResourcePlanningTableHeader: React.FC<ResourcePlanningTableHeaderProps> = ({
  sortBy,
  sortOrder,
  onSort,
  showBulkSelection = false,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
}) => {
  const handleSort = (column: string) => {
    onSort(column);
  };

  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <TableHeader>
      <TableRow className="h-8">
        {showBulkSelection && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              ref={(ref) => {
                if (ref) ref.indeterminate = isIndeterminate;
              }}
              onCheckedChange={(checked) => onSelectAll?.(checked as boolean)}
              aria-label="Select all"
            />
          </TableHead>
        )}
        <TableHead className="w-40">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('employee_name')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Employee
            {sortBy === 'employee_name' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-32">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('bill_type')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Bill Type
            {sortBy === 'bill_type' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-48">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('project_name')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Project
            {sortBy === 'project_name' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-24">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('engagement_percentage')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Engagement
            {sortBy === 'engagement_percentage' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-24">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('billing_percentage')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Billing
            {sortBy === 'billing_percentage' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-28">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('engagement_start_date')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Start Date
            {sortBy === 'engagement_start_date' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-28">
          <Button 
            variant="ghost" 
            onClick={() => handleSort('release_date')}
            className="h-6 p-0 font-semibold hover:bg-transparent"
          >
            Release Date
            {sortBy === 'release_date' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-40">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
