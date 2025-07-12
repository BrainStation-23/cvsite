
import { useState, useMemo } from 'react';
import { usePlannedResources } from './use-planned-resources';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';

export interface CalendarResource {
  id: string;
  profileId: string;
  profileName: string;
  employeeId: string;
  engagementPercentage: number;
  engagementStartDate: string;
  releaseDate: string | null;
  projectName: string | null;
  billTypeName: string | null;
}

export interface CalendarDay {
  date: Date;
  resources: CalendarResource[];
  totalEngagement: number;
  availableResources: number;
  overAllocatedResources: number;
}

export function useResourceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = useState(false);
  
  // Get planned resources with filters applied
  const plannedResources = usePlannedResources();
  
  // Apply filters to the search query and other filters
  React.useEffect(() => {
    plannedResources.setSearchQuery(searchQuery);
    plannedResources.setSelectedSbu(selectedSbu);
    plannedResources.setSelectedManager(selectedManager);
  }, [searchQuery, selectedSbu, selectedManager]);

  const { data: resourceData, isLoading, error } = plannedResources;

  // Convert resource planning data to calendar format
  const calendarData = useMemo(() => {
    if (!resourceData?.length) return [];

    return resourceData
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
        billTypeName: resource.bill_type?.name || null,
      }));
  }, [resourceData, showUnplanned]);

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
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
  }, [currentMonth, calendarData]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
  };

  return {
    currentMonth,
    selectedDate,
    setSelectedDate,
    calendarDays,
    calendarData,
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    
    // Filter states and handlers
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
  };
}
