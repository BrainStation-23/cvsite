
import { useState, useCallback, useMemo } from 'react';
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

const defaultAdvancedFilters: AdvancedFilters = {
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

export function useUnifiedResourcePlanning() {
  // Core tab and filter state
  const [activeTab, setActiveTab] = useState('planned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultAdvancedFilters);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Stable filter clear functions
  const clearBasicFilters = useCallback(() => {
    console.log('Clearing basic filters');
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    setCurrentPage(1);
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    console.log('Clearing advanced filters');
    setAdvancedFilters(defaultAdvancedFilters);
    setCurrentPage(1);
  }, []);

  const updateAdvancedFilters = useCallback((updates: Partial<AdvancedFilters>) => {
    console.log('Updating advanced filters:', updates);
    setAdvancedFilters(prev => ({ ...prev, ...updates }));
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // Memoized RPC parameters
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
          weekly_validation_filter: 'all',
        };
      case 'unplanned':
        return {
          ...baseParams,
          include_unplanned: true,
          include_weekly_validation: false,
          weekly_validation_filter: 'all',
        };
      case 'weekly-validation':
        return {
          ...baseParams,
          include_unplanned: false,
          include_weekly_validation: true,
          weekly_validation_filter: 'pending',
        };
      default:
        return {
          ...baseParams,
          include_unplanned: false,
          include_weekly_validation: false,
          weekly_validation_filter: 'all',
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

  // Data fetching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'unified-resource-planning',
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
      console.log('Unified Resource Planning Query:', { activeTab, ...rpcParams });

      const { data: rpcData, error } = await supabase.rpc('get_comprehensive_resource_planning_data', rpcParams);

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

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

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Basic filters
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    clearBasicFilters,
    
    // Advanced filters
    advancedFilters,
    setAdvancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
    
    // Data and pagination
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
