
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
    unplannedResources: data,
    isLoading,
  } = unplannedResources;

  console.log('UnplannedResourcesTab data:', data);
  console.log('UnplannedResourcesTab isLoading:', isLoading);

  // The RPC function returns an array directly, so we use data instead of data.unplannedResources
  const resources = Array.isArray(data) ? data : [];

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
      pagination={undefined}
      currentPage={1}
      setCurrentPage={() => {}}
      isLoading={isLoading}
      onCreatePlan={onCreatePlan}
    />
  );
};
