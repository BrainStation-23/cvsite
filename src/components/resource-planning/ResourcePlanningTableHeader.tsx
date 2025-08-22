
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ResourcePlanningTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const ResourcePlanningTableHeader: React.FC<ResourcePlanningTableHeaderProps> = ({
  sortBy,
  sortOrder,
  onSort,
}) => {
  const handleSort = (column: string) => {
    console.log('ResourcePlanningTableHeader - handleSort called:', { column, currentSortBy: sortBy, currentSortOrder: sortOrder });
    onSort(column);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getButtonClasses = (column: string) => {
    const baseClasses = "flex items-center gap-2 p-0 h-auto font-medium justify-start";
    return sortBy === column 
      ? `${baseClasses} text-primary bg-primary/10 rounded px-1` 
      : `${baseClasses}`;
  };

  const getSubButtonClasses = (column: string) => {
    const baseClasses = "flex items-center gap-1 p-0 h-auto text-xs text-muted-foreground justify-start";
    return sortBy === column 
      ? `${baseClasses} text-primary bg-primary/10 rounded px-1` 
      : `${baseClasses}`;
  };

  return (
    <TooltipProvider>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                onClick={() => handleSort('profile.last_name')}
                className={getButtonClasses('profile.last_name')}
              >
                Employee {getSortIcon('profile.last_name')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSort('employee_id')}
                className={getSubButtonClasses('employee_id')}
              >
                By ID {getSortIcon('employee_id')}
              </Button>
            </div>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort('bill_type')}
              className={getButtonClasses('bill_type')}
            >
              Bill Type {getSortIcon('bill_type')}
            </Button>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort('project')}
              className={getButtonClasses('project')}
            >
              Project {getSortIcon('project')}
            </Button>
          </TableHead>
          
          <TableHead className="w-16">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('engagement_percentage')}
                  className={`flex items-center gap-1 p-0 h-auto font-medium text-xs ${
                    sortBy === 'engagement_percentage' ? 'text-primary bg-primary/10 rounded px-1' : ''
                  }`}
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
                  onClick={() => handleSort('billing_percentage')}
                  className={`flex items-center gap-1 p-0 h-auto font-medium text-xs ${
                    sortBy === 'billing_percentage' ? 'text-primary bg-primary/10 rounded px-1' : ''
                  }`}
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
              onClick={() => handleSort('engagement_start_date')}
              className={getButtonClasses('engagement_start_date')}
            >
              Start Date {getSortIcon('engagement_start_date')}
            </Button>
          </TableHead>
          
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort('release_date')}
              className={getButtonClasses('release_date')}
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
