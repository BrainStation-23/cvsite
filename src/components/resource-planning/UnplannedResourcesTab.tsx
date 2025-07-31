
import React from 'react';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';

interface UnplannedResourcesTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  onCreatePlan: (profileId: string) => void;
  // Centralized resource planning state
  resourcePlanningState: any;
}

export const UnplannedResourcesTab: React.FC<UnplannedResourcesTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  onCreatePlan,
  resourcePlanningState,
}) => {
  const {
    data,
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
  } = resourcePlanningState;

  console.log('UnplannedResourcesTab data:', data);
  console.log('UnplannedResourcesTab isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  return (
    <UnplannedResourcesTable 
      resources={data}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      onCreatePlan={onCreatePlan}
    />
  );
};
