
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyValidationData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
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

interface UseWeeklyValidationOptions {
  searchQuery?: string;
  selectedSbu?: string | null;
  selectedManager?: string | null;
}

export function useWeeklyValidation(options: UseWeeklyValidationOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { searchQuery = '', selectedSbu = null, selectedManager = null } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const { data: weeklyValidationData, isLoading, error } = useQuery({
    queryKey: ['weekly-validation', searchQuery, currentPage, sortBy, sortOrder, selectedSbu, selectedManager],
    queryFn: async () => {
      console.log('Weekly Validation Query:', {
        searchQuery,
        currentPage,
        sortBy,
        sortOrder,
        selectedSbu,
        selectedManager
      });

      const { data: rpcData, error } = await supabase.rpc('get_weekly_validation_data', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('Weekly validation RPC call error:', error);
        throw error;
      }
      
      console.log('Weekly validation RPC response:', rpcData);

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

  const validateWeeklyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
      queryClient.invalidateQueries({ queryKey: ['resource-planning-planned'] });
      toast({
        title: 'Success',
        description: 'Weekly validation completed successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Weekly validation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate weekly data.',
        variant: 'destructive',
      });
    },
  });

  // Handle errors by showing toast when error occurs
  if (error) {
    console.error('Weekly validation query error:', error);
    toast({
      title: 'Error Loading Weekly Validation Data',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  }

  return {
    data: weeklyValidationData?.resource_planning || [],
    pagination: weeklyValidationData?.pagination,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    validateWeekly: validateWeeklyMutation.mutate,
    isValidating: validateWeeklyMutation.isPending,
  };
}
