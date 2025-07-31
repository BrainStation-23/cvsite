
import { useState } from 'react';
import { usePlannedResources } from './use-planned-resources';
import { useUnplannedResources } from './use-unplanned-resources';
import { useWeeklyValidation } from './use-weekly-validation';

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

export function useResourcePlanning() {
  const [showUnplanned, setShowUnplanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  
  // Advanced filters state
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

  // Get data from all hooks with current filter state
  const plannedResources = usePlannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
    ...advancedFilters
  });

  const unplannedResources = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager
  });

  const weeklyValidationData = useWeeklyValidation({
    searchQuery,
    selectedSbu,
    selectedManager,
    ...advancedFilters
  });

  const clearFilters = () => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
  };

  const clearAdvancedFilters = () => {
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
  };

  return {
    // Filter states
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    advancedFilters,
    setAdvancedFilters,
    clearFilters,
    clearAdvancedFilters,
    
    // Data from hooks
    plannedResources,
    unplannedResources,
    weeklyValidationData,
  };
}
