
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnplannedResourcesParams {
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

export function useUnplannedResources(params: UnplannedResourcesParams) {
  const { 
    searchQuery, 
    selectedSbu, 
    selectedManager,
    billTypeFilter,
    projectSearch,
    minEngagementPercentage,
    maxEngagementPercentage,
    minBillingPercentage,
    maxBillingPercentage,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo
  } = params;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'unplanned-resources', 
      searchQuery, 
      selectedSbu, 
      selectedManager,
      billTypeFilter,
      projectSearch,
      minEngagementPercentage,
      maxEngagementPercentage,
      minBillingPercentage,
      maxBillingPercentage,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      currentPage
    ],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        billTypeFilter,
        projectSearch,
        minEngagementPercentage,
        maxEngagementPercentage,
        minBillingPercentage,
        maxBillingPercentage,
        startDateFrom,
        startDateTo,
        endDateFrom,
        endDateTo,
        currentPage
      });

      const { data: rpcData, error } = await supabase.rpc('get_comprehensive_resource_planning_data', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager,
        bill_type_filter: billTypeFilter,
        project_search: projectSearch || null,
        min_engagement_percentage: minEngagementPercentage,
        max_engagement_percentage: maxEngagementPercentage,
        min_billing_percentage: minBillingPercentage,
        max_billing_percentage: maxBillingPercentage,
        start_date_from: startDateFrom || null,
        start_date_to: startDateTo || null,
        end_date_from: endDateFrom || null,
        end_date_to: endDateTo || null,
        include_unplanned: true,
        include_weekly_validation: false
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

      console.log('Unplanned Resources RPC response:', rpcData);
      
      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return {
          unplanned_resources: (rpcData as any).resource_planning || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: currentPage,
            per_page: itemsPerPage,
            page_count: 0
          }
        };
      }
      
      return {
        unplanned_resources: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: currentPage,
          per_page: itemsPerPage,
          page_count: 0
        }
      };
    }
  });

  return {
    unplannedResources: data || {
      unplanned_resources: [],
      pagination: {
        total_count: 0,
        filtered_count: 0,
        page: currentPage,
        per_page: itemsPerPage,
        page_count: 0
      }
    },
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    refetch
  };
}
