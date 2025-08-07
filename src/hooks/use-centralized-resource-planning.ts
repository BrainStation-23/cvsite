
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

  // Stable callbacks for clearing filters
  const clearBasicFilters = useCallback(() => {
    console.log('Clearing basic filters');
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    console.log('Clearing advanced filters');
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

  // Stable callback for updating advanced filters
  const updateAdvancedFilters = useCallback((updates: Partial<AdvancedFilters>) => {
    console.log('Updating advanced filters:', updates);
    setAdvancedFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoize the params to prevent unnecessary re-renders
  const resourcePlanningParams = useMemo(() => {
    const params = {
      activeTab,
      searchQuery,
      selectedSbu,
      selectedManager,
      advancedFilters,
    };
    console.log('Resource planning params updated:', params);
    return params;
  }, [activeTab, searchQuery, selectedSbu, selectedManager, advancedFilters]);

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
    updateAdvancedFilters,
    clearAdvancedFilters,
    
    // Resource planning data
    ...resourcePlanningData,
  };
}
