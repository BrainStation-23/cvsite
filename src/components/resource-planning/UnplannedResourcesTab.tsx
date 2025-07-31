
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
    currentPage,
    setCurrentPage,
  } = unplannedResources;

  console.log('UnplannedResourcesTab data:', data);
  console.log('UnplannedResourcesTab isLoading:', isLoading);

  // The RPC function returns an object with unplanned_resources and pagination
  const resources = data?.unplanned_resources || [];
  const pagination = data?.pagination;

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
