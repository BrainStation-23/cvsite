
import React from 'react';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';
import { useUnplannedResources } from '@/hooks/use-unplanned-resources';

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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading unplanned resources: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UnplannedResourcesTable
        resources={unplannedResources.unplanned_resources || []}
        pagination={unplannedResources.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        onCreatePlan={onCreatePlan}
      />
    </div>
  );
};
