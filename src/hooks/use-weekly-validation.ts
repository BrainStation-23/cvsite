
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyValidationData {
  id: string;
  profile_id: string;
  project_id: string | null;
  bill_type_id: string | null;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
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

interface WeeklyValidationResponse {
  resource_planning: WeeklyValidationData[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

interface UseWeeklyValidationProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  billTypeFilter?: string | null;
  projectSearch?: string;
  minEngagementPercentage?: number | null;
  maxEngagementPercentage?: number | null;
  minBillingPercentage?: number | null;
  maxBillingPercentage?: number | null;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export function useWeeklyValidation(filters: UseWeeklyValidationProps) {
  const { toast } = useToast();

  const queryResult = useQuery({
    queryKey: [
      'weekly-validation',
      filters.searchQuery,
      filters.selectedSbu,
      filters.selectedManager,
      filters.billTypeFilter,
      filters.projectSearch,
      filters.minEngagementPercentage,
      filters.maxEngagementPercentage,
      filters.minBillingPercentage,
      filters.maxBillingPercentage,
      filters.startDateFrom,
      filters.startDateTo,
      filters.endDateFrom,
      filters.endDateTo
    ],
    queryFn: async () => {
      console.log('Weekly Validation Query:', filters);

      const { data: rpcData, error } = await supabase.rpc('get_weekly_validation_resources', {
        search_query: filters.searchQuery || null,
        page_number: 1,
        items_per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: filters.selectedSbu,
        manager_filter: filters.selectedManager,
        bill_type_filter: filters.billTypeFilter || null,
        project_search: filters.projectSearch || null,
        min_engagement_percentage: filters.minEngagementPercentage,
        max_engagement_percentage: filters.maxEngagementPercentage,
        min_billing_percentage: filters.minBillingPercentage,
        max_billing_percentage: filters.maxBillingPercentage,
        start_date_from: filters.startDateFrom || null,
        start_date_to: filters.startDateTo || null,
        end_date_from: filters.endDateFrom || null,
        end_date_to: filters.endDateTo || null
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

      console.log('Weekly Validation RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData && 'pagination' in rpcData) {
        return {
          resource_planning: (rpcData as any).resource_planning || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: 10,
            page_count: 0
          }
        };
      } else {
        console.warn('Unexpected RPC response structure:', rpcData);
        return {
          resource_planning: [],
          pagination: {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: 10,
            page_count: 0
          }
        };
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast({
          title: 'Error Loading Weekly Validation Data',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    }
  });

  return {
    data: queryResult.data?.resource_planning || [],
    pagination: queryResult.data?.pagination,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
}
