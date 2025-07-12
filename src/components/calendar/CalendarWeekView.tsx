
import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarDay as CalendarDayType } from '@/hooks/use-resource-calendar';

interface CalendarWeekViewProps {
  currentDate: Date;
  calendarDays: CalendarDayType[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  calendarDays,
  selectedDate,
  onDateSelect,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">
        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayData = calendarDays.find(d => isSameDay(d.date, day));
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
          return (
            <Card
              key={day.toISOString()}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary",
                isCurrentDay && "bg-blue-50"
              )}
              onClick={() => onDateSelect(day)}
            >
              <CardContent className="p-4">
                <div className="text-center mb-3">
                  <div className="text-sm font-medium text-gray-600">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isCurrentDay && "text-blue-600"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                {dayData && dayData.resources.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {dayData.resources.length} resource{dayData.resources.length !== 1 ? 's' : ''}
                      </span>
                      {dayData.overAllocatedResources > 0 && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {dayData.resources.slice(0, 3).map((resource, idx) => (
                        <div key={idx} className="text-xs truncate bg-white/50 px-2 py-1 rounded">
                          {resource.profileName}
                          <Badge 
                            variant={resource.engagementPercentage > 100 ? 'destructive' : 'secondary'}
                            className="ml-1 text-xs"
                          >
                            {resource.engagementPercentage}%
                          </Badge>
                        </div>
                      ))}
                      {dayData.resources.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayData.resources.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400">
                    No resources
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
