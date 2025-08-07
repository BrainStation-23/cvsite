
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useResourcePlanningData } from './use-resource-planning-data';

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

export function useCentralizedResourcePlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Centralized filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('planned');
  
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

  // Use unified data fetching hook
  const resourcePlanningData = useResourcePlanningData({
    activeTab,
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters,
  });

  // Enhanced cache invalidation function
  const invalidateAllResourcePlanningQueries = useCallback(() => {
    console.log('Invalidating all resource planning queries');
    
    // Invalidate all resource planning related queries
    queryClient.invalidateQueries({ queryKey: ['resource-planning-data'] });
    queryClient.invalidateQueries({ queryKey: ['resource-planning-planned'] });
    queryClient.invalidateQueries({ queryKey: ['resource-planning-unplanned'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
    
    // Force refetch the current data
    queryClient.refetchQueries({ queryKey: ['resource-planning-data'] });
    
    // Also trigger a refetch of the current resource planning data
    resourcePlanningData.refetch();
  }, [queryClient, resourcePlanningData]);

  // Clear filters function
  const clearBasicFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    resourcePlanningData.resetPage();
  }, [resourcePlanningData]);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
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
    resourcePlanningData.resetPage();
  }, [resourcePlanningData]);

  // Tab change handler with page reset
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    resourcePlanningData.resetPage();
  }, [resourcePlanningData]);

  // Mutation for weekly validation
  const validateWeeklyMutation = useMutation({
    mutationFn: async (resourcePlanningId: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: true })
        .eq('id', resourcePlanningId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAllResourcePlanningQueries();
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

  // Enhanced delete mutation with proper cache invalidation
  const deleteResourcePlanningMutation = useMutation({
    mutationFn: async (resourcePlanningId: string) => {
      console.log('Deleting resource planning with ID:', resourcePlanningId);
      const { error } = await supabase
        .from('resource_planning')
        .delete()
        .eq('id', resourcePlanningId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      console.log('Successfully deleted resource planning:', resourcePlanningId);
      return resourcePlanningId;
    },
    onSuccess: (deletedId) => {
      console.log('Delete mutation onSuccess called for ID:', deletedId);
      invalidateAllResourcePlanningQueries();
      toast({
        title: 'Success',
        description: 'Resource planning entry deleted successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource planning entry.',
        variant: 'destructive',
      });
    },
  });

  return {
    // Filter state
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    activeTab,
    setActiveTab: handleTabChange,
    advancedFilters,
    setAdvancedFilters,

    // Data from unified hook
    ...resourcePlanningData,

    // Filter actions
    clearBasicFilters,
    clearAdvancedFilters,

    // Weekly validation mutation
    validateWeekly: validateWeeklyMutation.mutate,
    isValidating: validateWeeklyMutation.isPending,

    // Delete mutation
    deleteResourcePlanning: deleteResourcePlanningMutation.mutate,
    isDeleting: deleteResourcePlanningMutation.isPending,

    // Enhanced refresh function
    refresh: invalidateAllResourcePlanningQueries,
  };
}
