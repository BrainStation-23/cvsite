
import React from 'react';
import { ResourcePlanningFilters } from '@/components/resource-planning/ResourcePlanningFilters';
import { AdvancedResourceFilters } from '@/components/resource-planning/AdvancedResourceFilters';

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
  projectLevelFilter: string | null;
  projectBillTypeFilter: string | null;
  projectTypeFilter: string | null;
  expertiseFilter: string | null;
}

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
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
  onClearAdvancedFilters: () => void;
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
  advancedFilters,
  onAdvancedFiltersChange,
  onClearAdvancedFilters,
}) => {
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
      />
      
      <AdvancedResourceFilters
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        onClearFilters={onClearAdvancedFilters}
      />
    </div>
  );
};
