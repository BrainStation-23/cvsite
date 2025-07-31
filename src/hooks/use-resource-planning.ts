
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

  // Memoize the clear functions to prevent re-renders
  const clearFilters = useCallback(() => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters(initialAdvancedFilters);
  }, []);

  // Memoize filter parameters to prevent object recreation
  const filterParams = useMemo(() => ({
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters,
  }), [searchQuery, selectedSbu, selectedManager, advancedFilters]);

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
    
    // Memoized parameters for data hooks
    filterParams,
  };
}
