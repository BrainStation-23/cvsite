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

export function usePlannedResourcesTab(isActive: boolean = true) {
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

  // Data fetching - only enabled when tab is active
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['planned-resources-tab', rpcParams],
    queryFn: async () => {
      console.log('Planned Resources Tab Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('get_planned_resource_data', rpcParams);

      if (error) {
        console.error('Planned resources RPC call error:', error);
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
    enabled: isActive,
  });

  // Bulk completion mutation
  const bulkCompletionMutation = useMutation({
    mutationFn: async (resourcePlanningIds: string[]) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ engagement_complete: true })
        .in('id', resourcePlanningIds);

      if (error) throw error;
    },
    onSuccess: (_, resourcePlanningIds) => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      toast({
        title: 'Success',
        description: `${resourcePlanningIds.length} resource assignments marked as complete.`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk completion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark resource assignments as complete.',
        variant: 'destructive',
      });
    },
  });

  // Bulk deletion mutation
  const bulkDeletionMutation = useMutation({
    mutationFn: async (resourcePlanningIds: string[]) => {
      const { error } = await supabase
        .from('resource_planning')
        .delete()
        .in('id', resourcePlanningIds);

      if (error) throw error;
    },
    onSuccess: (_, resourcePlanningIds) => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      toast({
        title: 'Success',
        description: `${resourcePlanningIds.length} resource assignments deleted successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk deletion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource assignments.',
        variant: 'destructive',
      });
    },
  });

  // Bulk invalidation mutation
  const bulkInvalidationMutation = useMutation({
    mutationFn: async (resourcePlanningIds: string[]) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: false })
        .in('id', resourcePlanningIds);

      if (error) throw error;
    },
    onSuccess: (_, resourcePlanningIds) => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      toast({
        title: 'Success',
        description: `${resourcePlanningIds.length} resource assignments invalidated successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk invalidation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to invalidate resource assignments.',
        variant: 'destructive',
      });
    },
  });

  // Bulk copy mutation
  const bulkCopyMutation = useMutation({
    mutationFn: async (resourcePlanningIds: string[]) => {
      // First fetch the original records
      const { data: originalRecords, error: fetchError } = await supabase
        .from('resource_planning')
        .select('*')
        .in('id', resourcePlanningIds);

      if (fetchError) throw fetchError;

      if (!originalRecords || originalRecords.length === 0) {
        throw new Error('No records found to copy');
      }

      // Create new records based on the original ones
      const recordsToCopy = originalRecords.map(record => ({
        profile_id: record.profile_id,
        project_id: record.project_id,
        bill_type_id: record.bill_type_id,
        engagement_percentage: record.engagement_percentage,
        billing_percentage: record.billing_percentage,
        engagement_start_date: record.engagement_start_date,
        release_date: record.release_date,
        engagement_complete: false,
        weekly_validation: false,
      }));

      const { error: insertError } = await supabase
        .from('resource_planning')
        .insert(recordsToCopy);

      if (insertError) throw insertError;
    },
    onSuccess: (_, resourcePlanningIds) => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      toast({
        title: 'Success',
        description: `${resourcePlanningIds.length} resource assignments copied successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk copy error:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy resource assignments.',
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
    isLoading: isActive ? isLoading : false,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    resetPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // Bulk operations
    bulkComplete: bulkCompletionMutation.mutate,
    bulkDelete: bulkDeletionMutation.mutate,
    bulkInvalidate: bulkInvalidationMutation.mutate,
    bulkCopy: bulkCopyMutation.mutate,
    isBulkCompleting: bulkCompletionMutation.isPending,
    isBulkDeleting: bulkDeletionMutation.isPending,
    isBulkInvalidating: bulkInvalidationMutation.isPending,
    isBulkCopying: bulkCopyMutation.isPending,
  };
}
