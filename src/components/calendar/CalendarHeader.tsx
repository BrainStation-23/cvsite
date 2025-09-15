
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface CalendarHeaderProps {
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  monthCount: number;
  onIncreaseMonths: () => void;
  onDecreaseMonths: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onPreviousMonth,
  onNextMonth,
  onToday,
  monthCount,
  onIncreaseMonths,
  onDecreaseMonths,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">

        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Month count controls */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onDecreaseMonths} aria-label="Show fewer months">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{monthCount} month{monthCount === 1 ? '' : 's'}</span>
        <Button variant="outline" size="sm" onClick={onIncreaseMonths} aria-label="Show more months">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
