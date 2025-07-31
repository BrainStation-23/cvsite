
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

  // Clear filters function
  const clearBasicFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    resourcePlanningData.resetPage();
  }, [resourcePlanningData.resetPage]);

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
  }, [resourcePlanningData.resetPage]);

  // Tab change handler with page reset
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    resourcePlanningData.resetPage();
  }, [resourcePlanningData.resetPage]);

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
      queryClient.invalidateQueries({ queryKey: ['resource-planning-data'] });
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
  };
}
