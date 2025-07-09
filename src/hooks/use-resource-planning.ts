
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

interface UnplannedResource {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  sbu_name: string;
  manager_name: string;
}

interface ResourcePlanningResponse {
  resource_planning: ResourcePlanningData[];
  unplanned_resources: UnplannedResource[];
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
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = useState(false);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['resource-planning', searchQuery, currentPage, sortBy, sortOrder, selectedSbu, selectedManager, showUnplanned],
    queryFn: async () => {
      if (showUnplanned) {
        // Fetch unplanned resources
        let query = supabase
          .from('profiles')
          .select(`
            id,
            employee_id,
            first_name,
            last_name,
            sbu_id,
            manager,
            general_information(current_designation),
            sbus(name),
            manager_profile:profiles!profiles_manager_fkey(first_name, last_name)
          `)
          .is('resource_planning.profile_id', null);

        // Apply SBU filter
        if (selectedSbu) {
          query = query.eq('sbu_id', selectedSbu);
        }

        // Apply Manager filter
        if (selectedManager) {
          query = query.eq('manager', selectedManager);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.or(`
            first_name.ilike.%${searchQuery}%,
            last_name.ilike.%${searchQuery}%,
            employee_id.ilike.%${searchQuery}%
          `);
        }

        // Left join to check for existing resource planning
        query = query.leftJoin('resource_planning', 'profiles.id', 'resource_planning.profile_id');

        const { data: unplannedData, error: unplannedError } = await query;

        if (unplannedError) throw unplannedError;

        // Filter out profiles that have resource planning entries
        const filteredUnplanned = (unplannedData || []).filter(profile => 
          !profile.resource_planning || profile.resource_planning.length === 0
        );

        return {
          resource_planning: [],
          unplanned_resources: filteredUnplanned.map((profile: any) => ({
            id: profile.id,
            employee_id: profile.employee_id,
            first_name: profile.first_name || 'N/A',
            last_name: profile.last_name || 'N/A',
            current_designation: profile.general_information?.[0]?.current_designation || 'N/A',
            sbu_name: profile.sbus?.name || 'N/A',
            manager_name: profile.manager_profile ? 
              `${profile.manager_profile.first_name || ''} ${profile.manager_profile.last_name || ''}`.trim() || 'N/A' 
              : 'N/A'
          })),
          pagination: {
            total_count: filteredUnplanned.length,
            filtered_count: filteredUnplanned.length,
            page: 1,
            per_page: filteredUnplanned.length,
            page_count: 1
          }
        };
      } else {
        // Use the existing RPC function with additional filters
        const { data, error } = await supabase.rpc('get_resource_planning_data', {
          search_query: searchQuery || null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: sortBy,
          sort_order: sortOrder,
          sbu_filter: selectedSbu,
          manager_filter: selectedManager
        });

        if (error) throw error;
        
        return {
          ...data,
          unplanned_resources: []
        } as ResourcePlanningResponse;
      }
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

  const clearFilters = () => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return {
    data: data?.resource_planning || [],
    unplannedResources: data?.unplanned_resources || [],
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
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
    createResourcePlanning: createResourcePlanningMutation.mutate,
    updateResourcePlanning: updateResourcePlanningMutation.mutate,
    deleteResourcePlanning: deleteResourcePlanningMutation.mutate,
    isCreating: createResourcePlanningMutation.isPending,
    isUpdating: updateResourcePlanningMutation.isPending,
    isDeleting: deleteResourcePlanningMutation.isPending,
  };
}
