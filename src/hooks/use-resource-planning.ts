
import { useState } from 'react';
import { usePlannedResources } from './use-planned-resources';
import { useUnplannedResources } from './use-unplanned-resources';

export function useResourcePlanning() {
  const [showUnplanned, setShowUnplanned] = useState(false);

  const plannedResources = usePlannedResources();
  const unplannedResources = useUnplannedResources();

  const clearFilters = () => {
    plannedResources.setSelectedSbu(null);
    plannedResources.setSelectedManager(null);
    unplannedResources.setSelectedSbu(null);
    unplannedResources.setSelectedManager(null);
    setShowUnplanned(false);
    plannedResources.setSearchQuery('');
    unplannedResources.setSearchQuery('');
    plannedResources.setCurrentPage(1);
    unplannedResources.setCurrentPage(1);
  };

  // Sync filters between planned and unplanned resources
  const setSelectedSbu = (sbu: string | null) => {
    plannedResources.setSelectedSbu(sbu);
    unplannedResources.setSelectedSbu(sbu);
  };

  const setSelectedManager = (manager: string | null) => {
    plannedResources.setSelectedManager(manager);
    unplannedResources.setSelectedManager(manager);
  };

  const setSearchQuery = (query: string) => {
    if (showUnplanned) {
      unplannedResources.setSearchQuery(query);
    } else {
      plannedResources.setSearchQuery(query);
    }
  };

  const currentSearchQuery = showUnplanned 
    ? unplannedResources.searchQuery 
    : plannedResources.searchQuery;

  return {
    // Data
    data: plannedResources.data,
    unplannedResources: unplannedResources.unplannedResources,
    pagination: showUnplanned ? unplannedResources.pagination : plannedResources.pagination,
    
    // Loading states
    isLoading: showUnplanned ? unplannedResources.isLoading : plannedResources.isLoading,
    error: showUnplanned ? unplannedResources.error : plannedResources.error,
    
    // Search and filters
    searchQuery: currentSearchQuery,
    setSearchQuery,
    selectedSbu: plannedResources.selectedSbu,
    setSelectedSbu,
    selectedManager: plannedResources.selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
    
    // Pagination
    currentPage: showUnplanned ? unplannedResources.currentPage : plannedResources.currentPage,
    setCurrentPage: showUnplanned ? unplannedResources.setCurrentPage : plannedResources.setCurrentPage,
    
    // Planned resources specific
    sortBy: plannedResources.sortBy,
    setSortBy: plannedResources.setSortBy,
    sortOrder: plannedResources.sortOrder,
    setSortOrder: plannedResources.setSortOrder,
    
    // Mutations
    createResourcePlanning: plannedResources.createResourcePlanning,
    updateResourcePlanning: plannedResources.updateResourcePlanning,
    deleteResourcePlanning: plannedResources.deleteResourcePlanning,
    isCreating: plannedResources.isCreating,
    isUpdating: plannedResources.isUpdating,
    isDeleting: plannedResources.isDeleting,
  };
}
