
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useResourcePlanningOperations } from './use-resource-planning-operations';

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string | null;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string | null;
  startDateTo: string | null;
  endDateFrom: string | null;
  endDateTo: string | null;
}

export const useWeeklyValidationTab = (isActive: boolean = true) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    billTypeFilter: null,
    projectSearch: null,
    minEngagementPercentage: null,
    maxEngagementPercentage: null,
    minBillingPercentage: null,
    maxBillingPercentage: null,
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
  });

  const { updateResourcePlanning, isUpdating } = useResourcePlanningOperations();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSbu, selectedManager, sortBy, sortOrder, advancedFilters]);

  // Add logging for sort changes
  useEffect(() => {
    console.log('Weekly Validation Tab - Sort state changed:', { sortBy, sortOrder });
  }, [sortBy, sortOrder]);

  const handleSort = (column: string) => {
    console.log('Weekly Validation Tab - handleSort called:', { column, currentSortBy: sortBy, currentSortOrder: sortOrder });
    
    if (sortBy === column) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      console.log('Weekly Validation Tab - Toggling sort order to:', newOrder);
      setSortOrder(newOrder);
    } else {
      console.log('Weekly Validation Tab - Setting new sort column:', column);
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const queryParams = {
    search_query: searchQuery || null,
    page_number: currentPage,
    items_per_page: 10,
    sort_by: sortBy,
    sort_order: sortOrder,
    sbu_filter: selectedSbu,
    manager_filter: selectedManager,
    bill_type_filter: advancedFilters.billTypeFilter,
    project_search: advancedFilters.projectSearch,
    min_engagement_percentage: advancedFilters.minEngagementPercentage,
    max_engagement_percentage: advancedFilters.maxEngagementPercentage,
    min_billing_percentage: advancedFilters.minBillingPercentage,
    max_billing_percentage: advancedFilters.maxBillingPercentage,
    start_date_from: advancedFilters.startDateFrom,
    start_date_to: advancedFilters.startDateTo,
    end_date_from: advancedFilters.endDateFrom,
    end_date_to: advancedFilters.endDateTo,
  };

  console.log('Weekly Validation Tab Query:', queryParams);

  const {
    data: weeklyValidationData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['weekly-validation', queryParams],
    queryFn: async () => {
      console.log('Weekly Validation Tab - Fetching data with params:', queryParams);
      
      const { data, error } = await supabase.rpc('get_weekly_validation_data', queryParams);
      
      if (error) {
        console.error('Weekly Validation Tab - RPC Error:', error);
        throw error;
      }
      
      console.log('Weekly Validation Tab - Received data:', data);
      return data;
    },
    enabled: isActive,
  });

  const handleValidate = async (id: string) => {
    console.log('Weekly Validation Tab - Validating resource:', id);
    await updateResourcePlanning({ 
      id, 
      updates: { weekly_validation: true } 
    });
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      billTypeFilter: null,
      projectSearch: null,
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: null,
      startDateTo: null,
      endDateFrom: null,
      endDateTo: null,
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSort,
    advancedFilters,
    setAdvancedFilters,
    clearAdvancedFilters,
    weeklyValidationData,
    isLoading,
    error,
    refetch,
    handleValidate,
    isValidating: isUpdating,
  };
};
