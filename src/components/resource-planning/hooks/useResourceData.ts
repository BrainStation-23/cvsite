
import { useMemo } from 'react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { useWeeklyValidation } from '@/hooks/use-weekly-validation';

interface UseResourceDataParams {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  advancedFilters: {
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
  };
}

export function useResourceData(params: UseResourceDataParams) {
  console.log('useResourceData called with params:', params);
  
  // Create stable parameter objects to prevent unnecessary re-renders
  const plannedParams = useMemo(() => ({
    searchQuery: params.searchQuery,
    selectedSbu: params.selectedSbu,
    selectedManager: params.selectedManager,
    billTypeFilter: params.advancedFilters.billTypeFilter,
    projectSearch: params.advancedFilters.projectSearch,
    minEngagementPercentage: params.advancedFilters.minEngagementPercentage,
    maxEngagementPercentage: params.advancedFilters.maxEngagementPercentage,
    minBillingPercentage: params.advancedFilters.minBillingPercentage,
    maxBillingPercentage: params.advancedFilters.maxBillingPercentage,
    startDateFrom: params.advancedFilters.startDateFrom,
    startDateTo: params.advancedFilters.startDateTo,
    endDateFrom: params.advancedFilters.endDateFrom,
    endDateTo: params.advancedFilters.endDateTo,
  }), [
    params.searchQuery,
    params.selectedSbu,
    params.selectedManager,
    params.advancedFilters.billTypeFilter,
    params.advancedFilters.projectSearch,
    params.advancedFilters.minEngagementPercentage,
    params.advancedFilters.maxEngagementPercentage,
    params.advancedFilters.minBillingPercentage,
    params.advancedFilters.maxBillingPercentage,
    params.advancedFilters.startDateFrom,
    params.advancedFilters.startDateTo,
    params.advancedFilters.endDateFrom,
    params.advancedFilters.endDateTo,
  ]);

  const unplannedParams = useMemo(() => ({
    searchQuery: params.searchQuery,
    selectedSbu: params.selectedSbu,
    selectedManager: params.selectedManager,
  }), [params.searchQuery, params.selectedSbu, params.selectedManager]);

  const plannedResources = usePlannedResources(plannedParams);
  const unplannedResources = useUnplannedResources(unplannedParams);
  const weeklyValidationData = useWeeklyValidation(plannedParams);

  return useMemo(() => ({
    plannedResources,
    unplannedResources,
    weeklyValidationData,
  }), [plannedResources, unplannedResources, weeklyValidationData]);
}
