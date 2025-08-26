import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ResourcePlanningTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  // Bulk selection props
  showBulkSelection?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (checked: boolean | 'indeterminate') => void;
}

export const ResourcePlanningTableHeader: React.FC<ResourcePlanningTableHeaderProps> = ({
  sortBy,
  sortOrder,
  onSort,
  showBulkSelection = false,
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <TableHeader>
        <TableRow>
          {showBulkSelection && (
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                ref={(el) => {
                  if (el) {
                    const input = el.querySelector('input') as HTMLInputElement;
                    if (input) {
                      input.indeterminate = isIndeterminate;
                    }
                  }
                }}
              />
            </TableHead>
          )}
          
          <TableHead>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                onClick={() => onSort('profile.last_name')}
                className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
              >
                Employee {getSortIcon('profile.last_name')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onSort('employee_id')}
                className="flex items-center gap-1 p-0 h-auto text-xs text-muted-foreground justify-start"
              >
                By ID {getSortIcon('employee_id')}
              </Button>
            </div>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('bill_type')}
              className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
            >
              Bill Type {getSortIcon('bill_type')}
            </Button>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('project')}
              className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
            >
              Project {getSortIcon('project')}
            </Button>
          </TableHead>
          
          <TableHead className="w-16">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSort('engagement_percentage')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs"
                >
                  Eng% {getSortIcon('engagement_percentage')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Engagement Percentage</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          
          <TableHead className="w-16">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSort('billing_percentage')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs"
                >
                  Bill% {getSortIcon('billing_percentage')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Billing Percentage</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('engagement_start_date')}
              className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
            >
              Start Date {getSortIcon('engagement_start_date')}
            </Button>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('release_date')}
              className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
            >
              Release Date {getSortIcon('release_date')}
            </Button>
          </TableHead>
          
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
};
