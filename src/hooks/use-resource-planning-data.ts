
import { useState, useMemo } from 'react';
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

export function useResourcePlanningData({
  activeTab,
  searchQuery,
  selectedSbu,
  selectedManager,
  advancedFilters,
}: UseResourcePlanningDataParams) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Reset page when filters or tab changes
  const resetPage = () => setCurrentPage(1);

  // Determine RPC parameters based on active tab
  const rpcParams = useMemo(() => {
    const baseParams = {
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
    };

    switch (activeTab) {
      case 'planned':
        return {
          ...baseParams,
          include_unplanned: false,
          include_weekly_validation: false,
        };
      case 'unplanned':
        return {
          ...baseParams,
          include_unplanned: true,
          include_weekly_validation: false,
        };
      case 'weekly-validation':
        return {
          ...baseParams,
          include_unplanned: false,
          include_weekly_validation: true,
        };
      default:
        return {
          ...baseParams,
          include_unplanned: false,
          include_weekly_validation: false,
        };
    }
  }, [
    activeTab,
    searchQuery,
    currentPage,
    sortBy,
    sortOrder,
    selectedSbu,
    selectedManager,
    advancedFilters
  ]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'resource-planning-data',
      activeTab,
      searchQuery,
      currentPage,
      sortBy,
      sortOrder,
      selectedSbu,
      selectedManager,
      advancedFilters,
    ],
    queryFn: async () => {
      console.log('Resource Planning Query:', { activeTab, ...rpcParams });

      const { data: rpcData, error } = await supabase.rpc('get_comprehensive_resource_planning_data', rpcParams);

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

      console.log('RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return {
          resource_planning: (rpcData as any).resource_planning || [],
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
        resource_planning: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: currentPage,
          per_page: itemsPerPage,
          page_count: 0
        }
      };
    },
    enabled: !!activeTab, // Only run query when we have an active tab
  });

  return {
    data: data?.resource_planning || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    resetPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}
