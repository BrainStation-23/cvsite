
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export interface ResourceCalendarData {
  id: string;
  profile_id: string;
  project_id: string;
  bill_type_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
  is_forecasted: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
    profile_image: string | null;
    current_designation: string;
  };
  sbu: {
    id: string;
    name: string;
    sbu_head_name: string | null;
    sbu_head_email: string | null;
  };
  manager: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    full_name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    client_name: string | null;
    description: string | null;
    budget: number;
    is_active: boolean;
    project_level: string;
    project_bill_type: string;
    project_type_name: string;
    project_manager: {
      id: string;
      first_name: string;
      last_name: string;
      employee_id: string;
      full_name: string;
    };
  } | null;
  bill_type: {
    id: string;
    name: string;
    is_billable: boolean;
    non_billed: boolean;
    is_support: boolean;
    color_code: string;
  } | null;
}

interface ResourceCalendarResponse {
  resource_planning: ResourceCalendarData[];
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
  projectLevelFilter?: string | null;
  projectBillTypeFilter?: string | null;
}

export function useResourceCalendarData(
  searchQuery: string,
  selectedSbu: string | null,
  selectedManager: string | null,
  startingMonth: Date,
  advancedFilters: AdvancedFilters = {}
) {

  const dateRange = { start: startOfMonth(startingMonth), end: endOfMonth(addMonths(startingMonth, 5)) };

  const { data: resourceData, isLoading, error } = useQuery({
    queryKey: [
      'resource-calendar-data', 
      searchQuery, 
      selectedSbu, 
      selectedManager, 
      dateRange.start.toISOString(), 
      dateRange.end.toISOString(),
      advancedFilters
    ],
    queryFn: async () => {
      console.log('Fetching calendar data with date range and filters:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        dateRange,
        advancedFilters
      });

      // Use calendar date range as primary filter, with advanced filters as additional constraints
      const calendarStartDate = dateRange.start.toISOString().split('T')[0];
      const calendarEndDate = dateRange.end.toISOString().split('T')[0];

      // Use the planned resource data function for calendar view with date range and advanced filters
      const { data: rpcData, error } = await supabase.rpc('get_planned_resource_calendar_data', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 1000,
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
        start_date_from: advancedFilters.startDateFrom || calendarStartDate,
        start_date_to: advancedFilters.startDateTo || calendarEndDate,
        end_date_from: advancedFilters.endDateFrom || null,
        end_date_to: advancedFilters.endDateTo || null,
        project_level_filter: advancedFilters.projectLevelFilter || null,
        project_bill_type_filter: advancedFilters.projectBillTypeFilter || null,
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }
      
      console.log('RPC response received:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        const response = rpcData as unknown as ResourceCalendarResponse;
        const resources = response.resource_planning || [];
        
        console.log(`Received ${resources.length} resources from RPC for date range:`, {
          start: calendarStartDate,
          end: calendarEndDate,
        });

        return resources;
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
