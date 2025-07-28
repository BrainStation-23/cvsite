
import React from 'react';
import { ResourcePlanningSearchControls } from '@/components/resource-planning/ResourcePlanningSearchControls';
import { ResourcePlanningFilters } from '@/components/resource-planning/ResourcePlanningFilters';

interface ResourceCalendarFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSbu: string | null;
  onSbuChange: (sbu: string | null) => void;
  selectedManager: string | null;
  onManagerChange: (manager: string | null) => void;
  showUnplanned: boolean;
  onShowUnplannedChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export const ResourceCalendarFilters: React.FC<ResourceCalendarFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedSbu,
  onSbuChange,
  selectedManager,
  onManagerChange,
  showUnplanned,
  onShowUnplannedChange,
  onClearFilters,
}) => {
  const handleCreateNew = () => {
    // Not needed in calendar context, but required by the interface
  };

  return (
    <div className="space-y-4">
      <ResourcePlanningFilters
        searchQuery={searchQuery}
        setSearchQuery={onSearchChange}
        selectedSbu={selectedSbu}
        setSelectedSbu={onSbuChange}
        selectedManager={selectedManager}
        setSelectedManager={onManagerChange}
        clearFilters={onClearFilters}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};
