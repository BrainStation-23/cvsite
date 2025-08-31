
import { useState, useMemo } from 'react';
import { useResourceCalendarData } from './use-resource-calendar-data';
import { startOfMonth, endOfMonth, eachDayOfInterval, parseISO, addMonths } from 'date-fns';

export type CalendarViewType = 'month' | 'timeline';

export interface CalendarResource {
  id: string;
  profileId: string;
  profileName: string;
  employeeId: string;
  engagementPercentage: number;
  engagementStartDate: string;
  releaseDate: string | null;
  projectName: string | null;
  forecastedProject: string | null;
  billTypeName: string | null;
}

export interface CalendarDay {
  date: Date;
  resources: CalendarResource[];
  totalEngagement: number;
  availableResources: number;
  overAllocatedResources: number;
}

interface AdvancedFilters {
  billTypeFilter?: string | null;
  projectSearch?: string | null;
  minEngagementPercentage?: number | null;
  maxEngagementPercentage?: number | null;
  minBillingPercentage?: number | null;
  maxBillingPercentage?: number | null;
  startDateFrom?: string | null;
  startDateTo?: string | null;
  endDateFrom?: string | null;
  endDateTo?: string | null;
}

export function useResourceCalendar(
  searchQuery: string,
  selectedSbu: string | null,
  selectedManager: string | null,
  showUnplanned: boolean,
  advancedFilters: AdvancedFilters = {}
) {
  const [startingMonth, setStartingMonth] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(3);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewType>('timeline');
  
  // Calculate the date range based on starting month and number of months to show
  const dateRange = useMemo(() => {
    const start = startOfMonth(startingMonth);
    const end = endOfMonth(addMonths(start, monthsToShow - 1));
    return { start, end };
  }, [startingMonth, monthsToShow]);

  // Get calendar data using the updated hook with advanced filters
  const { data: resourceData, isLoading, error } = useResourceCalendarData(
    searchQuery,
    selectedSbu,
    selectedManager,
    dateRange.start,
    currentView,
    advancedFilters
  );

  // Convert resource planning data to calendar format
  const calendarData = useMemo(() => {
    if (!resourceData?.length) return [];

    console.log('Processing calendar data:', {
      totalResources: resourceData.length,
      showUnplanned
    });

    const processedData = resourceData
      .filter(resource => {
        // Apply showUnplanned filter
        if (showUnplanned) {
          // Show only resources without project assignments
          return !resource.project?.id;
        }
        return true; // Show all resources when showUnplanned is false
      })
      .map(resource => ({
        id: resource.id,
        profileId: resource.profile_id,
        profileName: `${resource.profile.first_name} ${resource.profile.last_name}`.trim(),
        employeeId: resource.profile.employee_id || '',
        engagementPercentage: resource.engagement_percentage || 0,
        engagementStartDate: resource.engagement_start_date || '',
        releaseDate: resource.release_date,
        projectName: resource.project?.project_name || null,
        forecastedProject: resource.forecasted_project || null,
        billTypeName: resource.bill_type?.name || null,
      }));

    console.log('Processed calendar data:', {
      filtered: processedData.length,
      original: resourceData.length
    });

    return processedData;
  }, [resourceData, showUnplanned]);

  // Generate calendar days based on current view (for month view)
  const calendarDays = useMemo(() => {
    if (currentView === 'timeline') {
      // For timeline view, we don't need daily breakdown
      return [];
    }

    let start: Date, end: Date;
    
    start = startOfMonth(startingMonth);
    end = endOfMonth(startingMonth);
    
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayResources = calendarData.filter(resource => {
        const startDate = resource.engagementStartDate ? parseISO(resource.engagementStartDate) : null;
        const endDate = resource.releaseDate ? parseISO(resource.releaseDate) : null;
        
        if (!startDate) return false;
        
        const isAfterStart = date >= startDate;
        const isBeforeEnd = !endDate || date <= endDate;
        
        return isAfterStart && isBeforeEnd;
      });

      // Calculate engagement statistics
      const resourceEngagements = new Map<string, number>();
      dayResources.forEach(resource => {
        const current = resourceEngagements.get(resource.profileId) || 0;
        resourceEngagements.set(resource.profileId, current + resource.engagementPercentage);
      });

      const totalEngagement = Array.from(resourceEngagements.values()).reduce((sum, eng) => sum + eng, 0);
      const overAllocatedResources = Array.from(resourceEngagements.values()).filter(eng => eng > 100).length;
      const availableResources = Array.from(resourceEngagements.values()).filter(eng => eng < 100).length;

      return {
        date,
        resources: dayResources,
        totalEngagement,
        availableResources,
        overAllocatedResources,
      };
    });
  }, [startingMonth, calendarData, currentView]);

  const goToPreviousMonth = () => {
    setStartingMonth(prev => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setStartingMonth(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setStartingMonth(new Date());
    setSelectedDate(new Date());
  };

  const increaseMonths = () => {
    if (monthsToShow < 6) {
      setMonthsToShow(prev => prev + 1);
    }
  };

  const decreaseMonths = () => {
    if (monthsToShow > 1) {
      setMonthsToShow(prev => prev - 1);
    }
  };

  return {
    startingMonth,
    monthsToShow,
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    calendarDays,
    calendarData,
    isLoading,
    error,
    dateRange,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    increaseMonths,
    decreaseMonths,
  };
}
