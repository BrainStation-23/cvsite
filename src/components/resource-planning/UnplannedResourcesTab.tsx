
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
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
  } = useUnplannedResources({
    searchQuery,
    selectedSbu,
    selectedManager,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  return (
    <UnplannedResourcesTable 
      resources={unplannedResources}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onCreatePlan={onCreatePlan}
    />
  );
};
