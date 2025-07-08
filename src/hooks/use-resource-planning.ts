
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  engagement_start_date: string;
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

export function useResourcePlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['resource-planning', searchQuery, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_resource_planning_data', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;
      return data as unknown as ResourcePlanningResponse;
    },
  });

  const createResourcePlanningMutation = useMutation({
    mutationFn: async (newResourcePlanning: {
      profile_id: string;
      bill_type_id?: string;
      project_id?: string;
      engagement_percentage: number;
      release_date?: string;
      engagement_start_date?: string;
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
      queryClient.invalidateQueries({ queryKey: ['resource-planning'] });
      toast({
        title: 'Success',
        description: 'Resource planning entry created successfully.',
      });
    },
    onError: (error: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['resource-planning'] });
      toast({
        title: 'Success',
        description: 'Resource planning entry updated successfully.',
      });
    },
    onError: (error: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['resource-planning'] });
      toast({
        title: 'Success',
        description: 'Resource planning entry deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resource planning entry.',
        variant: 'destructive',
      });
    },
  });

  return {
    data: data?.resource_planning || [],
    pagination: data?.pagination,
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
    createResourcePlanning: createResourcePlanningMutation.mutate,
    updateResourcePlanning: updateResourcePlanningMutation.mutate,
    deleteResourcePlanning: deleteResourcePlanningMutation.mutate,
    isCreating: createResourcePlanningMutation.isPending,
    isUpdating: updateResourcePlanningMutation.isPending,
    isDeleting: deleteResourcePlanningMutation.isPending,
  };
}
