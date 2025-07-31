
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useResourceCalendar } from '@/hooks/use-resource-calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarQuarterView } from './CalendarQuarterView';
import { DayDetailsPanel } from './DayDetailsPanel';
import { CalendarViewSelector } from './CalendarViewSelector';
import { isSameDay } from 'date-fns';

interface ResourceCalendarViewProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  showUnplanned: boolean;
}

const ResourceCalendarView: React.FC<ResourceCalendarViewProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  showUnplanned,
}) => {
  const {
    currentMonth,
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    calendarDays,
    calendarData,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useResourceCalendar(searchQuery, selectedSbu, selectedManager, showUnplanned);

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

  const renderCalendarContent = () => {
    switch (currentView) {
      case 'quarter':
        return (
          <CalendarQuarterView
            currentDate={currentMonth}
            calendarData={calendarData}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        );
      case 'month':
      default:
        return (
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
              <DayDetailsPanel
                selectedDate={selectedDate}
                dayData={selectedDayData}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CalendarHeader
          currentMonth={currentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
        
        <CalendarViewSelector
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {renderCalendarContent()}
    </div>
  );
};

export default ResourceCalendarView;
