import React from 'react';
import { format } from 'date-fns';
import { GanttTimelineMonth } from './types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface GanttHeaderProps {
  timeline: GanttTimelineMonth[];
  resourceCount: number;
  sortBy: 'first_name' | 'employee_id';
  sortOrder: 'asc' | 'desc';
  onSort: (column: 'first_name' | 'employee_id') => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({ timeline, resourceCount, sortBy, sortOrder, onSort }) => {
    const getSortIcon = (column: string) => {
      if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
      return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };
  
  return (
    <div className="sticky top-0 z-10 bg-background border-b pr-1">
      {/* Month headers */}
      <div className="flex">
        <div className="w-80 flex-shrink-0 border-r bg-muted/50 p-2">
          <div className="text-sm font-medium">{resourceCount} {resourceCount === 1 ? 'Employee' : 'Employees'}</div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                onClick={() => onSort('first_name')}
                className="flex items-center gap-2 p-0 h-auto font-medium justify-start"
              >
                Employee {getSortIcon('first_name')}
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
        <div className="flex-1 flex">
          {timeline.map((month, monthIndex) => (
            <div
              key={monthIndex}
              className="flex-1 border-r last:border-r-0 bg-muted/50 p-2 text-center"
            >
              <div className="text-sm font-medium">
                {format(month.month, 'MMM yyyy')}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Week headers */}
      <div className="flex border-t">
        <div className="w-80 flex-shrink-0 border-r bg-muted/30 p-1">
          <div className="text-xs text-muted-foreground">Details</div>
        </div>
        <div className="flex-1 flex">
          {timeline.map((month, monthIndex) => (
            <div key={monthIndex} className="flex-1 flex">
              {month.weeks
                .filter((week) => format(week.weekStart, 'MM') === format(month.month, 'MM'))
                .map((week, weekIndex) => (
                  <div
                    key={`${monthIndex}-${weekIndex}`}
                    className={`flex-1 border-r last:border-r-0 p-1 text-center ${
                      week.isCurrentWeek ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {format(week.weekStart, 'dd')}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};