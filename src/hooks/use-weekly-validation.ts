
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyValidationParams {
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

export function useWeeklyValidation(params: WeeklyValidationParams) {
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'weekly-validation', 
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
      currentPage,
      sortBy,
      sortOrder
    ],
    queryFn: async () => {
      console.log('Weekly Validation Query:', {
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
        currentPage,
        sortBy,
        sortOrder
      });

      const { data: rpcData, error } = await supabase.rpc('get_comprehensive_resource_planning_data', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
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
        include_unplanned: false,
        include_weekly_validation: true
      });

      if (error) {
        console.error('Weekly validation RPC call error:', error);
        throw error;
      }

      console.log('Weekly validation RPC response:', rpcData);
      
      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        // Filter only records that need weekly validation (weekly_validation = false)
        const allRecords = (rpcData as any).resource_planning || [];
        const needsValidation = allRecords.filter((record: any) => !record.weekly_validation);
        
        return {
          resource_planning: needsValidation,
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: needsValidation.length,
            page: currentPage,
            per_page: itemsPerPage,
            page_count: Math.ceil(needsValidation.length / itemsPerPage)
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
    }
  });

  const validateMutation = useMutation({
    mutationFn: async (resourcePlanningId: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: true })
        .eq('id', resourcePlanningId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<{
        bill_type_id: string;
        project_id: string;
        engagement_percentage: number;
        billing_percentage: number;
        release_date: string;
        engagement_start_date: string;
      }> 
    }) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
      toast({
        title: 'Success',
        description: 'Resource planning updated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource planning.',
        variant: 'destructive',
      });
    },
  });

  return {
    data: data?.resource_planning || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    validateResourcePlanning: validateMutation.mutate,
    isValidating: validateMutation.isPending,
    updateResourcePlanning: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    validateWeekly: validateMutation.mutate,
  };
}
