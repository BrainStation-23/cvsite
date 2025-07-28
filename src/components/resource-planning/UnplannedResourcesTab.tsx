
import React from 'react';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';

interface UnplannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreatePlan: (profileId: string) => void;
  // Centralized data props
  unplannedResources: any;
}

export const UnplannedResourcesTab: React.FC<UnplannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreatePlan,
  unplannedResources,
}) => {
  const {
    unplannedResources: resources,
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
  } = unplannedResources;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  return (
    <UnplannedResourcesTable 
      resources={resources}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      onCreatePlan={onCreatePlan}
    />
  );
};
