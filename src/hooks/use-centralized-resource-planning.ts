
import { useState, useMemo, useCallback } from 'react';
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

const initialAdvancedFilters: AdvancedFilters = {
  billTypeFilter: null,
  projectSearch: '',
  minEngagementPercentage: null,
  maxEngagementPercentage: null,
  minBillingPercentage: null,
  maxBillingPercentage: null,
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: '',
};

export function useCentralizedResourcePlanning() {
  const [activeTab, setActiveTab] = useState('planned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(initialAdvancedFilters);
  
  const itemsPerPage = 10;

  // Memoize the RPC parameters to prevent unnecessary recalculations
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
          include_weekly_validation: false,
        };
      case 'unplanned':
        return null; // Will return empty data
      case 'weekly-validation':
        return {
          ...baseParams,
          include_weekly_validation: true,
        };
      default:
        return {
          ...baseParams,
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
    // Include individual filter properties instead of the whole object
    advancedFilters.billTypeFilter,
    advancedFilters.projectSearch,
    advancedFilters.minEngagementPercentage,
    advancedFilters.maxEngagementPercentage,
    advancedFilters.minBillingPercentage,
    advancedFilters.maxBillingPercentage,
    advancedFilters.startDateFrom,
    advancedFilters.startDateTo,
    advancedFilters.endDateFrom,
    advancedFilters.endDateTo
  ]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'centralized-resource-planning',
      activeTab,
      rpcParams
    ],
    queryFn: async () => {
      // Return empty data for unplanned tab
      if (activeTab === 'unplanned' || !rpcParams) {
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
      }

      console.log('Centralized Resource Planning Query:', { activeTab, ...rpcParams });

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
    enabled: !!activeTab,
  });

  // Stable callback functions to prevent re-renders
  const clearBasicFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters(initialAdvancedFilters);
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    // State
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    advancedFilters,
    setAdvancedFilters,
    
    // Data
    data: data?.resource_planning || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    
    // Actions
    clearBasicFilters,
    clearAdvancedFilters,
    resetPage,
  };
}
