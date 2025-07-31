
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
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
  };
}

interface ResourcePlanningResponse {
  resource_planning: ResourcePlanningData[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

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

export function usePlannedResources() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
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
  });
  
  const itemsPerPage = 10;

  const { data: plannedData, isLoading, error } = useQuery({
    queryKey: [
      'planned-resources', 
      searchQuery, 
      currentPage, 
      sortBy, 
      sortOrder, 
      selectedSbu, 
      selectedManager,
      advancedFilters
    ],
    queryFn: async () => {
      console.log('Planned Resources Query:', {
        searchQuery,
        currentPage,
        sortBy,
        sortOrder,
        selectedSbu,
        selectedManager,
        advancedFilters
      });

      const { data: rpcData, error } = await supabase.rpc('get_planned_resources', {
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
        end_date_to: advancedFilters.endDateTo || null
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }
      
      console.log('RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData && 'pagination' in rpcData) {
        return {
          resource_planning: (rpcData as any).resource_planning || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: itemsPerPage,
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
            per_page: itemsPerPage,
            page_count: 0
          }
        };
      }
    }
  });

  const invalidateResourcePlanningQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['planned-resources'] });
    queryClient.invalidateQueries({ queryKey: ['unplanned-resources'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
  };

  const createResourcePlanningMutation = useMutation({
    mutationFn: async (newResourcePlanning: {
      profile_id: string;
      bill_type_id?: string;
      project_id?: string;
      engagement_percentage: number;
      billing_percentage?: number;
      release_date?: string;
      engagement_start_date?: string;
      engagement_complete?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .insert([newResourcePlanning])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Resource planning entry created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Create mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create resource planning entry.',
        variant: 'destructive',
      });
    },
  });

  const updateResourcePlanningMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<{
        bill_type_id: string;
        project_id: string;
        engagement_percentage: number;
        billing_percentage: number;
        release_date: string;
        engagement_start_date: string;
        engagement_complete: boolean;
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
      toast({
        title: 'Success',
        description: 'Resource planning entry updated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update resource planning entry.',
        variant: 'destructive',
      });
    },
  });

  const deleteResourcePlanningMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateResourcePlanningQueries();
      toast({
        title: 'Success',
        description: 'Resource planning entry deleted successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resource planning entry.',
        variant: 'destructive',
      });
    },
  });

  if (error) {
    console.error('Query error:', error);
    toast({
      title: 'Error Loading Resource Planning Data',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  }

  const createResourcePlanning = (
    data: Parameters<typeof createResourcePlanningMutation.mutate>[0],
    callbacks?: MutationCallbacks
  ) => {
    createResourcePlanningMutation.mutate(data, {
      onSuccess: () => {
        invalidateResourcePlanningQueries();
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const updateResourcePlanning = (
    data: Parameters<typeof updateResourcePlanningMutation.mutate>[0],
    callbacks?: MutationCallbacks
  ) => {
    updateResourcePlanningMutation.mutate(data, {
      onSuccess: () => {
        invalidateResourcePlanningQueries();
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  return {
    data: plannedData?.resource_planning || [],
    pagination: plannedData?.pagination,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    advancedFilters,
    setAdvancedFilters,
    createResourcePlanning,
    updateResourcePlanning,
    deleteResourcePlanning: deleteResourcePlanningMutation.mutate,
    isCreating: createResourcePlanningMutation.isPending,
    isUpdating: updateResourcePlanningMutation.isPending,
    isDeleting: deleteResourcePlanningMutation.isPending,
  };
}
