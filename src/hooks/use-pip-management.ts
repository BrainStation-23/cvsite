
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PIP, PIPFormData } from '@/types/pip';

interface PIPSearchParams {
  searchQuery?: string;
  sbuFilter?: string; // UUID as string
  expertiseFilter?: string; // UUID as string  
  managerFilter?: string; // UUID as string
  designationFilter?: string;
  statusFilter?: string;
  page?: number;
  itemsPerPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PIPSearchResult {
  pips: PIP[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export function usePIPManagement() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<PIPSearchParams>({
    page: 1,
    itemsPerPage: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch PIPs with search and filtering
  const { data: pipsData, isLoading, error } = useQuery({
    queryKey: ['pips', searchParams],
    queryFn: async (): Promise<PIPSearchResult> => {
      const { data, error } = await supabase.rpc('search_pips', {
        search_query: searchParams.searchQuery || null,
        sbu_filter: searchParams.sbuFilter || null,
        expertise_filter: searchParams.expertiseFilter || null,
        manager_filter: searchParams.managerFilter || null,
        designation_filter: searchParams.designationFilter || null,
        status_filter: searchParams.statusFilter || null,
        page_number: searchParams.page || 1,
        items_per_page: searchParams.itemsPerPage || 10,
        sort_by: searchParams.sortBy || 'created_at',
        sort_order: searchParams.sortOrder || 'desc'
      });

      if (error) {
        console.error('Error fetching PIPs:', error);
        throw error;
      }

      return data as unknown as PIPSearchResult;
    },
  });

  // Create PIP mutation
  const createPIPMutation = useMutation({
    mutationFn: async (formData: PIPFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .insert({
          profile_id: formData.profile_id,
          overall_feedback: formData.overall_feedback,
          start_date: formData.start_date,
          mid_date: formData.mid_date || null,
          end_date: formData.end_date,
          final_review: formData.final_review || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('PIP created successfully');
      queryClient.invalidateQueries({ queryKey: ['pips'] });
    },
    onError: (error) => {
      console.error('Error creating PIP:', error);
      toast.error('Failed to create PIP');
    },
  });

  // Update PIP mutation
  const updatePIPMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PIPFormData> }) => {
      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('PIP updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pips'] });
    },
    onError: (error) => {
      console.error('Error updating PIP:', error);
      toast.error('Failed to update PIP');
    },
  });

  // Delete PIP mutation
  const deletePIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('performance_improvement_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('PIP deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['pips'] });
    },
    onError: (error) => {
      console.error('Error deleting PIP:', error);
      toast.error('Failed to delete PIP');
    },
  });

  const updateSearchParams = (newParams: Partial<PIPSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 1 // Reset to page 1 when filtering
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      itemsPerPage: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return {
    pips: pipsData?.pips || [],
    pagination: pipsData?.pagination,
    isLoading,
    error,
    searchParams,
    updateSearchParams,
    clearFilters,
    createPIP: createPIPMutation.mutate,
    updatePIP: updatePIPMutation.mutate,
    deletePIP: deletePIPMutation.mutate,
    isCreating: createPIPMutation.isPending,
    isUpdating: updatePIPMutation.isPending,
    isDeleting: deletePIPMutation.isPending,
  };
}
