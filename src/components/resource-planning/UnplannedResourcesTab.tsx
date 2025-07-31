
import React from 'react';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';

interface UnplannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreatePlan: (profileId: string) => void;
}

export const UnplannedResourcesTab: React.FC<UnplannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreatePlan,
}) => {
  const {
    unplannedResources,
    currentPage,
    setCurrentPage,
    isLoading,
    error,
  } = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

  console.log('UnplannedResourcesTab data:', unplannedResources);
  console.log('UnplannedResourcesTab isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-destructive">Error loading unplanned resources: {error.message}</div>
      </div>
    );
  }

  return (
    <UnplannedResourcesTable 
      resources={unplannedResources.unplanned_resources}
      pagination={unplannedResources.pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      onCreatePlan={onCreatePlan}
    />
  );
};
