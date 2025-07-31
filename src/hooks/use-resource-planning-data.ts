
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

interface UseResourcePlanningDataParams {
  activeTab: string;
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  advancedFilters: AdvancedFilters;
}

export function useResourcePlanningData(params: UseResourcePlanningDataParams) {
  const {
    activeTab,
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters,
  } = params;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'resource-planning-data',
      activeTab,
      searchQuery,
      selectedSbu,
      selectedManager,
      advancedFilters,
      currentPage,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      console.log('Resource Planning Data Query:', {
        activeTab,
        searchQuery,
        selectedSbu,
        selectedManager,
        advancedFilters,
        currentPage,
      });

      if (activeTab === 'unplanned') {
        // Use unplanned resources RPC
        const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
          search_query: searchQuery || null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: 'created_at',
          sort_order: 'desc',
          sbu_filter: selectedSbu,
          manager_filter: selectedManager
        });

        if (error) {
          console.error('Unplanned resources RPC error:', error);
          throw error;
        }

        return rpcData;
      } else {
        // Use comprehensive resource planning RPC for planned and weekly validation
        const { data: rpcData, error } = await supabase.rpc('get_comprehensive_resource_planning_data', {
          search_query: searchQuery || null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: sortBy,
          sort_order: sortOrder,
          sbu_filter: selectedSbu,
          manager_filter: selectedManager,
          bill_type_filter: advancedFilters.billTypeFilter,
          project_search: advancedFilters.projectSearch || null,
          min_engagement_percentage: advancedFilters.minEngagementPercentage,
          max_engagement_percentage: advancedFilters.maxEngagementPercentage,
          min_billing_percentage: advancedFilters.minBillingPercentage,
          max_billing_percentage: advancedFilters.maxBillingPercentage,
          start_date_from: advancedFilters.startDateFrom || null,
          start_date_to: advancedFilters.startDateTo || null,
          end_date_from: advancedFilters.endDateFrom || null,
          end_date_to: advancedFilters.endDateTo || null,
          include_weekly_validation: activeTab === 'weekly-validation'
        });

        if (error) {
          console.error('Comprehensive resource planning RPC error:', error);
          throw error;
        }

        return rpcData;
      }
    }
  });

  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    data: data || null,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetPage,
  };
}
