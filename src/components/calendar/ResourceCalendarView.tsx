
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useResourceCalendar } from '@/hooks/use-resource-calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarQuarterView } from './CalendarQuarterView';
import { DayDetailsPanel } from './DayDetailsPanel';
import { ResourceCalendarFilters } from './ResourceCalendarFilters';
import { CalendarViewSelector } from './CalendarViewSelector';
import { isSameDay } from 'date-fns';

const ResourceCalendarView: React.FC = () => {
  const {
    currentMonth,
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    calendarDays,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
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

  const renderCalendarContent = () => {
    switch (currentView) {
      case 'day':
        return (
          <CalendarDayView
            selectedDate={selectedDate || currentMonth}
            dayData={selectedDayData}
          />
        );
      case 'week':
        return (
          <CalendarWeekView
            currentDate={selectedDate || currentMonth}
            calendarDays={calendarDays}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        );
      case 'quarter':
        return (
          <CalendarQuarterView
            currentDate={currentMonth}
            calendarDays={calendarDays}
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
      {/* Search and Filters */}
      <ResourceCalendarFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSbu={selectedSbu}
        onSbuChange={setSelectedSbu}
        selectedManager={selectedManager}
        onManagerChange={setSelectedManager}
        showUnplanned={showUnplanned}
        onShowUnplannedChange={setShowUnplanned}
        onClearFilters={clearFilters}
      />

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
