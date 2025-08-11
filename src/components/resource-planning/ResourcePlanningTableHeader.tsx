
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
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('profile.last_name')}
              className="flex items-center gap-2 p-0 h-auto font-medium"
            >
              Employee {getSortIcon('profile.last_name')}
            </Button>
          </TableHead>
          <TableHead>Bill Type</TableHead>
          <TableHead>Project</TableHead>
          <TableHead className="w-20">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSort('engagement_percentage')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs"
                >
                  Eng.% {getSortIcon('engagement_percentage')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Engagement Percentage</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="w-20">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onSort('billing_percentage')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs"
                >
                  Bill.% {getSortIcon('billing_percentage')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Billing Percentage</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Release Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
};
