
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export interface ResourceCalendarData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  forecasted_project: string | null;
  created_at: string;
  updated_at: string;
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
    color_code:string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  } | null;
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

export function useResourceCalendarData(
  searchQuery: string,
  selectedSbu: string | null,
  selectedManager: string | null,
  startingMonth: Date,
  viewType: 'month' | 'timeline' = 'timeline',
  advancedFilters: AdvancedFilters = {}
) {
  // Calculate date range - for timeline view, we'll get a broader range from the parent
  const dateRange = viewType === 'timeline' 
    ? { start: startOfMonth(startingMonth), end: endOfMonth(addMonths(startingMonth, 5)) } // Get 6 months of data for flexibility
    : { start: startOfMonth(startingMonth), end: endOfMonth(startingMonth) };

  const { data: resourceData, isLoading, error } = useQuery({
    queryKey: [
      'resource-calendar-data', 
      searchQuery, 
      selectedSbu, 
      selectedManager, 
      dateRange.start.toISOString(), 
      dateRange.end.toISOString(),
      viewType,
      advancedFilters
    ],
    queryFn: async () => {
      console.log('Fetching calendar data with advanced filters:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        dateRange,
        viewType,
        advancedFilters
      });

      // For timeline view, don't restrict dates unless advanced filters are provided
      // This ensures all overlapping engagements are returned
      let startDateParam = null;
      let endDateParam = null;
      
      if (viewType === 'timeline') {
        // Only use advanced filter dates for timeline view
        startDateParam = advancedFilters.startDateFrom || null;
        endDateParam = advancedFilters.startDateTo || null;
      } else {
        // For month view, use the calculated date range
        startDateParam = advancedFilters.startDateFrom || dateRange.start.toISOString().split('T')[0];
        endDateParam = advancedFilters.startDateTo || dateRange.end.toISOString().split('T')[0];
      }

      // Use the planned resource data function for calendar view with advanced filters
      const { data: rpcData, error } = await supabase.rpc('get_planned_resource_data', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 1000, // High limit to get all records
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager,
        bill_type_filter: advancedFilters.billTypeFilter || null,
        project_search: advancedFilters.projectSearch || null,
        min_engagement_percentage: advancedFilters.minEngagementPercentage || null,
        max_engagement_percentage: advancedFilters.maxEngagementPercentage || null,
        min_billing_percentage: advancedFilters.minBillingPercentage || null,
        max_billing_percentage: advancedFilters.maxBillingPercentage || null,
        start_date_from: startDateParam,
        start_date_to: endDateParam,
        end_date_from: advancedFilters.endDateFrom || null,
        end_date_to: advancedFilters.endDateTo || null,
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }
      
      console.log('Raw RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        const allResources = (rpcData as any).resource_planning || [];
        
        // Filter resources that overlap with the date range
        const filteredResources = allResources.filter((resource: ResourceCalendarData) => {
          if (!resource.engagement_start_date) return false;
          
          const startDate = new Date(resource.engagement_start_date);
          const endDate = resource.release_date ? new Date(resource.release_date) : new Date('2099-12-31');
          
          // Check if resource engagement overlaps with the viewing period
          const overlaps = startDate <= dateRange.end && endDate >= dateRange.start;
          
          return overlaps;
        });

        console.log(`Filtered ${filteredResources.length} resources from ${allResources.length} total for date range:`, {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
          viewType
        });

        return filteredResources;
      } else {
        console.warn('Unexpected RPC response structure:', rpcData);
        return [];
      }
    }
  });

  return {
    data: resourceData || [],
    isLoading,
    error,
    dateRange
  };
}
