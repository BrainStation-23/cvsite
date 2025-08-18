
import React from 'react';
import { ResourceStatisticsFilters } from './ResourceStatisticsFilters';
import { ResourceStatisticsContent } from './ResourceStatisticsContent';
import { ResourceCountStatistics } from '@/hooks/use-resource-count-statistics';

interface ResourceStatisticsOverviewProps {
  filters: {
    resourceType: string | null;
    billType: string | null;
    expertiseType: string | null;
    sbu: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  resourceCountData: ResourceCountStatistics | undefined;
  resourceCountLoading: boolean;
  groupBy: 'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType';
  showCharts: boolean;
  showTables: boolean;
}

export const ResourceStatisticsOverview: React.FC<ResourceStatisticsOverviewProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  resourceCountData,
  resourceCountLoading,
  groupBy,
  showCharts,
  showTables,
}) => {
  return (
    <div className="space-y-6">
      {/* Group By & Filtering Controls */}
      <ResourceStatisticsFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />

      {/* Statistics Content */}
      {resourceCountData && (
        <ResourceStatisticsContent
          resourceCountData={resourceCountData}
          resourceCountLoading={resourceCountLoading}
          filters={filters}
          groupBy={groupBy}
          showCharts={showCharts}
          showTables={showTables}
        />
      )}
    </div>
  );
};
