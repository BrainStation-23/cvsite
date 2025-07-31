
import React from 'react';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';

interface UnplannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string;
  selectedManager: string;
  onCreatePlan: (profileId: string) => void;
}

export const UnplannedResourcesTab: React.FC<UnplannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreatePlan,
}) => {
  const {
    data: unplannedResources = [],
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    setSearchQuery,
    setSelectedSbu: setSbu,
    setSelectedManager: setManager,
    clearFilters,
  } = useUnplannedResources(searchQuery, selectedSbu, selectedManager);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading unplanned resources: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResourcePlanningFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbu={selectedSbu || null}
        setSelectedSbu={(sbu) => setSbu(sbu || '')}
        selectedManager={selectedManager || null}
        setSelectedManager={(manager) => setManager(manager || '')}
        clearFilters={clearFilters}
        hideAdvancedFilters={true} // Hide advanced filters for unplanned resources
      />
      
      <UnplannedResourcesTable
        data={unplannedResources}
        isLoading={isLoading}
        onCreatePlan={onCreatePlan}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};
