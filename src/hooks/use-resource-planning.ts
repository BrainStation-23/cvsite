
import { useState, useCallback, useMemo } from 'react';

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

const initialAdvancedFilters: AdvancedFilters = {
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
};

export function useResourcePlanning() {
  const [showUnplanned, setShowUnplanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(initialAdvancedFilters);

  const clearFilters = useCallback(() => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters(initialAdvancedFilters);
  }, []);

  // Create a stable reference for filter parameters with explicit dependencies
  const filterParams = useMemo(() => ({
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters: {
      billTypeFilter: advancedFilters.billTypeFilter,
      projectSearch: advancedFilters.projectSearch,
      minEngagementPercentage: advancedFilters.minEngagementPercentage,
      maxEngagementPercentage: advancedFilters.maxEngagementPercentage,
      minBillingPercentage: advancedFilters.minBillingPercentage,
      maxBillingPercentage: advancedFilters.maxBillingPercentage,
      startDateFrom: advancedFilters.startDateFrom,
      startDateTo: advancedFilters.startDateTo,
      endDateFrom: advancedFilters.endDateFrom,
      endDateTo: advancedFilters.endDateTo,
    },
  }), [
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters.billTypeFilter,
    advancedFilters.projectSearch,
    advancedFilters.minEngagementPercentage,
    advancedFilters.maxEngagementPercentage,
    advancedFilters.minBillingPercentage,
    advancedFilters.maxBillingPercentage,
    advancedFilters.startDateFrom,
    advancedFilters.startDateTo,
    advancedFilters.endDateFrom,
    advancedFilters.endDateTo,
  ]);

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
    
    // Stable memoized parameters for data hooks
    filterParams,
  };
}
