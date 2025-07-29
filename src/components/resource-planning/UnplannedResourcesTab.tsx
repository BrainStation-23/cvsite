
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
  // Extract the actual array data from the hook response
  const {
    unplannedResources: resources = [],
    isLoading = false,
  } = unplannedResources;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  // Ensure resources is always an array
  const safeResources = Array.isArray(resources) ? resources : [];

  return (
    <UnplannedResourcesTable 
      resources={safeResources}
      pagination={undefined}
      currentPage={1}
      setCurrentPage={() => {}}
      isLoading={isLoading}
      onCreatePlan={onCreatePlan}
    />
  );
};
