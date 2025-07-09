
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
        // Fetch unplanned resources - profiles without resource planning entries
        let profilesQuery = supabase
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
          `);

        // Apply SBU filter
        if (selectedSbu) {
          profilesQuery = profilesQuery.eq('sbu_id', selectedSbu);
        }

        // Apply Manager filter
        if (selectedManager) {
          profilesQuery = profilesQuery.eq('manager', selectedManager);
        }

        // Apply search filter
        if (searchQuery) {
          profilesQuery = profilesQuery.or(`
            first_name.ilike.%${searchQuery}%,
            last_name.ilike.%${searchQuery}%,
            employee_id.ilike.%${searchQuery}%
          `);
        }

        const { data: profilesData, error: profilesError } = await profilesQuery;

        if (profilesError) throw profilesError;

        // Get all profile IDs that have resource planning entries
        const { data: plannedProfiles, error: plannedError } = await supabase
          .from('resource_planning')
          .select('profile_id');

        if (plannedError) throw plannedError;

        const plannedProfileIds = new Set(plannedProfiles.map(p => p.profile_id));

        // Filter out profiles that have resource planning entries
        const unplannedProfiles = (profilesData || []).filter(profile => 
          !plannedProfileIds.has(profile.id)
        );

        return {
          resource_planning: [],
          unplanned_resources: unplannedProfiles.map((profile: any) => ({
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
            total_count: unplannedProfiles.length,
            filtered_count: unplannedProfiles.length,
            page: 1,
            per_page: unplannedProfiles.length,
            page_count: 1
          }
        };
      } else {
        // Use the existing RPC function for planned resources
        const { data, error } = await supabase.rpc('get_resource_planning_data', {
          search_query: searchQuery || null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: sortBy,
          sort_order: sortOrder
        });

        if (error) throw error;
        
        return {
          resource_planning: data?.resource_planning || [],
          unplanned_resources: [],
          pagination: data?.pagination || {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: itemsPerPage,
            page_count: 0
          }
        };
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
