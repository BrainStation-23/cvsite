
import { useState } from 'react';
import { usePlannedResources } from './use-planned-resources';

export function useResourcePlanning() {
  const [showUnplanned, setShowUnplanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // Get planned resources data for count display only
  const plannedResources = usePlannedResources();

  const clearFilters = () => {
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
    setSearchQuery('');
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
    clearFilters,
    
    // Data for count display in tabs
    data: plannedResources.data,
  };
}
