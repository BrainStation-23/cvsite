import React from 'react';
import { format } from 'date-fns';
import { GanttTimelineMonth } from './types';

interface GanttHeaderProps {
  timeline: GanttTimelineMonth[];
  resourceCount: number;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({ timeline, resourceCount }) => {
  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      {/* Month headers */}
      <div className="flex">
        <div className="w-80 flex-shrink-0 border-r bg-muted/50 p-2">
          <div className="text-sm font-medium">{resourceCount} {resourceCount === 1 ? 'Employee' : 'Employees'}</div>
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
              {month.weeks.map((week, weekIndex) => (
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