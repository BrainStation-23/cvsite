
import { useState } from 'react';
import { usePlannedResources } from './use-planned-resources';

export function useResourcePlanning() {
  const [showUnplanned, setShowUnplanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  const plannedResources = usePlannedResources();

  const clearFilters = () => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
    plannedResources.setCurrentPage(1);
  };

  // Sync filters for planned resources only
  const handleSbuChange = (sbu: string | null) => {
    setSelectedSbu(sbu);
    plannedResources.setSelectedSbu(sbu);
  };

  const handleManagerChange = (manager: string | null) => {
    setSelectedManager(manager);
    plannedResources.setSelectedManager(manager);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!showUnplanned) {
      plannedResources.setSearchQuery(query);
    }
  };

  return {
    // Data
    data: plannedResources.data,
    pagination: plannedResources.pagination,
    
    // Loading states
    isLoading: plannedResources.isLoading,
    error: plannedResources.error,
    
    // Search and filters
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedSbu,
    setSelectedSbu: handleSbuChange,
    selectedManager,
    setSelectedManager: handleManagerChange,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
    
    // Pagination
    currentPage: plannedResources.currentPage,
    setCurrentPage: plannedResources.setCurrentPage,
    
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
