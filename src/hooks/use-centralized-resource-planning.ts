
import { useState, useCallback, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState('planned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  
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

  // Stable callback for clearing basic filters
  const clearBasicFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  }, []);

  // Stable callback for clearing advanced filters
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
  }, []);

  // Memoize the params to prevent unnecessary re-renders
  const resourcePlanningParams = useMemo(() => ({
    activeTab,
    searchQuery,
    selectedSbu,
    selectedManager,
    advancedFilters,
  }), [activeTab, searchQuery, selectedSbu, selectedManager, advancedFilters]);

  const resourcePlanningData = useResourcePlanningData(resourcePlanningParams);

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Basic filters
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    clearBasicFilters,
    
    // Advanced filters
    advancedFilters,
    setAdvancedFilters,
    clearAdvancedFilters,
    
    // Resource planning data
    ...resourcePlanningData,
  };
}
