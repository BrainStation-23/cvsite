
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useWeeklyValidationTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Basic filters
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
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    setCurrentPage(1);
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters(defaultAdvancedFilters);
    setCurrentPage(1);
  }, []);

  const updateAdvancedFilters = useCallback((updates: Partial<AdvancedFilters>) => {
    setAdvancedFilters(prev => ({ ...prev, ...updates }));
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // Memoized RPC parameters
  const rpcParams = useMemo(() => ({
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
  }), [
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
    queryKey: ['weekly-validation-tab', rpcParams],
    queryFn: async () => {
      console.log('Weekly Validation Tab Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('get_weekly_validation_data', rpcParams);

      if (error) {
        console.error('Weekly validation RPC call error:', error);
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
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (resourcePlanningId: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: true })
        .eq('id', resourcePlanningId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      toast({
        title: 'Success',
        description: 'Resource planning validated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Validation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate resource planning.',
        variant: 'destructive',
      });
    },
  });

  return {
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
    
    // Validation functionality
    validateWeekly: validateMutation.mutate,
    isValidating: validateMutation.isPending,
  };
}
