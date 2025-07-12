
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Users, AlertTriangle } from 'lucide-react';
import { useResourceCalendar } from '@/hooks/use-resource-calendar';
import type { CalendarDay as CalendarDayType } from '@/hooks/use-resource-calendar';
import { cn } from '@/lib/utils';

const ResourceCalendarView: React.FC = () => {
  const {
    currentMonth,
    selectedDate,
    setSelectedDate,
    calendarDays,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useResourceCalendar();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const selectedDayData = selectedDate 
    ? calendarDays.find(day => isSameDay(day.date, selectedDate))
    : null;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>Allocated</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Over-allocated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <CalendarGrid 
                calendarDays={calendarDays}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Day Details Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayData ? (
                <DayDetailsPanel dayData={selectedDayData} />
              ) : (
                <p className="text-gray-500 text-sm">Click on a calendar day to view resource details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface CalendarGridProps {
  calendarDays: CalendarDayType[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
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

interface DayDetailsPanelProps {
  dayData: CalendarDayType;
}

const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({ dayData }) => {
  const { date, resources, overAllocatedResources, availableResources } = dayData;

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Users className="h-4 w-4 mx-auto mb-1 text-green-600" />
          <div className="text-sm font-medium">{availableResources}</div>
          <div className="text-xs text-gray-600">Available</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-600" />
          <div className="text-sm font-medium">{overAllocatedResources}</div>
          <div className="text-xs text-gray-600">Over-allocated</div>
        </div>
      </div>

      {/* Resource List */}
      {resources.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Resources ({resources.length})</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resources.map((resource) => (
              <div key={`${resource.id}-${resource.profileId}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{resource.profileName}</div>
                    <div className="text-xs text-gray-600">{resource.employeeId}</div>
                  </div>
                  <Badge variant={resource.engagementPercentage > 100 ? 'destructive' : 'secondary'}>
                    {resource.engagementPercentage}%
                  </Badge>
                </div>
                
                {resource.projectName && (
                  <div className="text-xs text-gray-600 mb-1">
                    Project: {resource.projectName}
                  </div>
                )}
                
                {resource.billTypeName && (
                  <div className="text-xs text-gray-600">
                    Type: {resource.billTypeName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resources allocated</p>
        </div>
      )}
    </div>
  );
};

export default ResourceCalendarView;
