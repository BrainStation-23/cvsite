
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  format,
  eachWeekOfInterval,
  eachDayOfInterval
} from 'date-fns';

export type CalendarViewType = 'monthly' | 'weekly';

interface CalendarResourceData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  } | null;
  sbu: {
    id: string;
    name: string;
  } | null;
}

export function useResourceCalendarData() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  const { data: calendarData, isLoading, error, refetch } = useQuery({
    queryKey: [
      'resource-calendar',
      currentDate,
      viewType,
      searchQuery,
      selectedSbu,
      selectedManager
    ],
    queryFn: async () => {
      console.log('Resource Calendar Query:', {
        currentDate,
        viewType
      });

      // Use the planned resources function since calendar typically shows planned resources
      const { data: rpcData, error } = await supabase.rpc('get_planned_resources', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 1000, // High limit to get all records for calendar view
        sort_by: 'engagement_start_date',
        sort_order: 'asc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager,
        bill_type_filter: null,
        project_search: null,
        min_engagement_percentage: null,
        max_engagement_percentage: null,
        min_billing_percentage: null,
        max_billing_percentage: null,
        start_date_from: null,
        start_date_to: null,
        end_date_from: null,
        end_date_to: null
      });

      if (error) {
        console.error('Calendar RPC call error:', error);
        throw error;
      }

      console.log('Calendar RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return (rpcData as any).resource_planning || [];
      } else {
        console.warn('Unexpected calendar RPC response structure:', rpcData);
        return [];
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Calendar query error:', error);
        toast({
          title: 'Error Loading Calendar Data',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    }
  });

  const getCalendarPeriods = () => {
    if (viewType === 'weekly') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachWeekOfInterval({ start, end });
    }
  };

  const getResourcesForPeriod = (periodDate: Date): CalendarResourceData[] => {
    if (!calendarData) return [];

    return calendarData.filter((resource: CalendarResourceData) => {
      const startDate = new Date(resource.engagement_start_date);
      const endDate = resource.release_date ? new Date(resource.release_date) : new Date();

      if (viewType === 'weekly') {
        // For daily view in weekly calendar
        const dayStart = new Date(periodDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(periodDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        return startDate <= dayEnd && endDate >= dayStart;
      } else {
        // For weekly view in monthly calendar
        const weekStart = startOfWeek(periodDate);
        const weekEnd = endOfWeek(periodDate);
        
        return startDate <= weekEnd && endDate >= weekStart;
      }
    });
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewType === 'weekly') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getFormattedPeriod = () => {
    if (viewType === 'weekly') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  return {
    // Data
    calendarData: calendarData || [],
    isLoading,
    error,
    refetch,
    
    // View state
    currentDate,
    setCurrentDate,
    viewType,
    setViewType,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    
    // Utility functions
    getCalendarPeriods,
    getResourcesForPeriod,
    navigatePeriod,
    goToToday,
    getFormattedPeriod
  };
}
