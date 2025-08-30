
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface TimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  months: Date[];
  monthsToShow: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onIncreaseMonths: () => void;
  onDecreaseMonths: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ 
  timelineStart, 
  timelineEnd, 
  months,
  monthsToShow,
  onPreviousMonth,
  onNextMonth,
  onIncreaseMonths,
  onDecreaseMonths
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button variant="outline" size="sm" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDecreaseMonths}
              disabled={monthsToShow <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {monthsToShow} month{monthsToShow !== 1 ? 's' : ''}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onIncreaseMonths}
              disabled={monthsToShow >= 6}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onNextMonth}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold">Resource Timeline</h2>
        <p className="text-muted-foreground">
          {format(timelineStart, 'MMM d')} - {format(timelineEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Header Row */}
      <div 
        className="grid gap-0 border-b border-border mb-4 pb-2"
        style={{ gridTemplateColumns: `250px repeat(${months.length}, 1fr)` }}
      >
        <div className="font-semibold text-sm">Employee</div>
        {months.map((month) => (
          <div key={month.toISOString()} className="text-center font-semibold text-sm">
            {format(month, 'MMM yyyy')}
          </div>
        ))}
      </div>
    </div>
  );
};
