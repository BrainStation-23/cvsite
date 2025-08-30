
import React from 'react';
import { useResourceCalendar } from '@/hooks/use-resource-calendar';
import { CalendarQuarterView } from './CalendarQuarterView';

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

interface ResourceCalendarViewProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  showUnplanned: boolean;
  advancedFilters: AdvancedFilters;
}

const ResourceCalendarView: React.FC<ResourceCalendarViewProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  showUnplanned,
  advancedFilters,
}) => {
  const {
    currentMonth,
    selectedDate,
    setSelectedDate,
    calendarData,
    isLoading,
  } = useResourceCalendar(
    searchQuery, 
    selectedSbu, 
    selectedManager, 
    showUnplanned,
    advancedFilters
  );

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

  const renderCalendarContent = () => {
    return (
      <CalendarQuarterView
        currentDate={currentMonth}
        calendarData={calendarData}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    );
  };

  return (
    <div className="space-y-6">
      {renderCalendarContent()}
    </div>
  );
};

export default ResourceCalendarView;
