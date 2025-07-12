
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useResourceCalendar } from '@/hooks/use-resource-calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailsPanel } from './DayDetailsPanel';
import { ResourceCalendarFilters } from './ResourceCalendarFilters';
import { isSameDay } from 'date-fns';

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

      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

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
    </div>
  );
};

export default ResourceCalendarView;
