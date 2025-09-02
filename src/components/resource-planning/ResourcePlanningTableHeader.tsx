
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ResourcePlanningTableHeaderProps {
  sortBy: string | null;
  sortOrder: 'asc' | 'desc' | null;
  onSort: (column: string) => void;
}

export function ResourcePlanningTableHeader({
  sortBy,
  sortOrder,
  onSort
}: ResourcePlanningTableHeaderProps) {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[180px]">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              onClick={() => onSort('last_name')}
              className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
            >
              Employee {getSortIcon('last_name')}
            </Button>
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                onClick={() => onSort('last_name')}
                className="flex items-center gap-1 p-0 h-auto text-xs text-muted-foreground justify-start"
              >
                By Name {getSortIcon('last_name')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onSort('employee_id')}
                className="flex items-center gap-1 p-0 h-auto text-xs text-muted-foreground justify-start"
              >
                By ID {getSortIcon('employee_id')}
              </Button>
            </div>
          </div>
        </TableHead>
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            onClick={() => onSort('bill_type_name')}
            className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
          >
            Bill Type {getSortIcon('bill_type_name')}
          </Button>
        </TableHead>
        <TableHead className="w-[150px]">
          <Button
            variant="ghost"
            onClick={() => onSort('project_name')}
            className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
          >
            Project {getSortIcon('project_name')}
          </Button>
        </TableHead>
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            onClick={() => onSort('engagement_start_date')}
            className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
          >
            Start Date {getSortIcon('engagement_start_date')}
          </Button>
        </TableHead>
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            onClick={() => onSort('engagement_percentage')}
            className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
          >
            Engagement % {getSortIcon('engagement_percentage')}
          </Button>
        </TableHead>
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            onClick={() => onSort('release_date')}
            className="flex items-center gap-1 p-0 h-auto text-sm font-medium justify-start"
          >
            Release Date {getSortIcon('release_date')}
          </Button>
        </TableHead>
        <TableHead className="w-[120px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
