
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarDay as CalendarDayType } from '@/hooks/use-resource-calendar';

interface CalendarGridProps {
  calendarDays: CalendarDayType[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  calendarDays, 
  selectedDate, 
  onDateSelect 
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="w-full">
      {/* Week headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            dayData={day}
            isSelected={selectedDate ? isSameDay(day.date, selectedDate) : false}
            onClick={() => onDateSelect(day.date)}
          />
        ))}
      </div>
    </div>
  );
};

interface CalendarDayProps {
  dayData: CalendarDayType;
  isSelected: boolean;
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ dayData, isSelected, onClick }) => {
  const { date, resources, overAllocatedResources, availableResources } = dayData;
  const dayNumber = format(date, 'd');
  const isCurrentDay = isToday(date);
  
  const getBgColor = () => {
    if (overAllocatedResources > 0) return 'bg-red-50 hover:bg-red-100';
    if (resources.length > 0) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'bg-green-50 hover:bg-green-100';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-primary border-2';
    if (isCurrentDay) return 'border-blue-400 border-2';
    return 'border-gray-200 border';
  };

  return (
    <div
      className={cn(
        'min-h-[80px] p-2 cursor-pointer transition-colors',
        getBgColor(),
        getBorderColor(),
        'hover:shadow-sm'
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          'text-sm font-medium',
          isCurrentDay ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'
        )}>
          {dayNumber}
        </span>
        {overAllocatedResources > 0 && (
          <AlertTriangle className="h-3 w-3 text-red-500" />
        )}
      </div>
      
      {resources.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600">
            {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </div>
          {resources.slice(0, 2).map((resource, idx) => (
            <div key={idx} className="text-xs truncate bg-white/50 px-1 py-0.5 rounded">
              {resource.profileName}
            </div>
          ))}
          {resources.length > 2 && (
            <div className="text-xs text-gray-500">
              +{resources.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};
