
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, CalendarClock } from 'lucide-react';

export type CalendarViewType = 'month' | 'quarter';

interface CalendarViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

export const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  currentView,
  onViewChange,
}) => {
  const views = [
    { key: 'month' as CalendarViewType, label: 'Month', icon: CalendarRange },
    { key: 'quarter' as CalendarViewType, label: 'Quarter', icon: CalendarClock },
  ];

  return (
    <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
      {views.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={currentView === key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(key)}
          className="flex items-center space-x-1"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};
