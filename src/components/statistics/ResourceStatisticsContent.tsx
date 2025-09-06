
import React from 'react';
import { ResourceCountCharts } from './ResourceCountCharts';
import { ResourceCountTable } from './ResourceCountTable';
import { ResourceCountStatistics } from '@/hooks/use-resource-count-statistics';
import { SbuBillingMetrics } from './SbuBillingMetrics';

interface ResourceStatisticsContentProps {
  resourceCountData: ResourceCountStatistics;
  resourceCountLoading: boolean;
  filters: {
    resourceType: string | null;
    billType: string | null;
    expertiseType: string | null;
    sbu: string | null;
  };
  groupBy: 'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType';
  showCharts: boolean;
  showTables: boolean;
}

export const ResourceStatisticsContent: React.FC<ResourceStatisticsContentProps> = ({
  resourceCountData,
  resourceCountLoading,
  filters,
  groupBy,
  showCharts,
  showTables,
}) => {
  const getTableData = () => {
    switch (groupBy) {
      case 'sbu':
        return resourceCountData.by_sbu;
      case 'resourceType':
        return resourceCountData.by_resource_type;
      case 'billType':
        return resourceCountData.by_bill_type;
      case 'expertiseType':
        return resourceCountData.by_expertise_type;
      default:
        return [];
    }
  };

  const getTableTitle = () => {
    switch (groupBy) {
      case 'sbu':
        return filters.sbu ? `SBU Resources (${filters.sbu})` : "Resources by SBU";
      case 'resourceType':
        return filters.resourceType ? `Resource Type (${filters.resourceType})` : "Resources by Type";
      case 'billType':
        return filters.billType ? `Bill Type (${filters.billType})` : "Resources by Bill Type";
      case 'expertiseType':
        return filters.expertiseType ? `Expertise (${filters.expertiseType})` : "Resources by Expertise";
      default:
        return "Resource Statistics";
    }
  };

  return (
    <div className="space-y-6">
      {/* SBU Billing Metrics */}
      <SbuBillingMetrics filters={filters} />
      
      <div className={`grid gap-6 ${showCharts && showTables ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Charts Section */}
        {showCharts && (
          <div className="space-y-6">
            <ResourceCountCharts 
              data={resourceCountData} 
              isLoading={resourceCountLoading}
              filters={filters}
              groupBy={groupBy}
            />
          </div>
        )}
        
        {/* Tables Section */}
        {showTables && (
          <div className="space-y-6">
            {groupBy !== 'all' ? (
              <ResourceCountTable
                title={getTableTitle()}
                data={getTableData()}
                isLoading={resourceCountLoading}
              />
            ) : (
              <div className="grid gap-4">
                <ResourceCountTable
                  title="Resources by SBU"
                  data={resourceCountData.by_sbu}
                  isLoading={resourceCountLoading}
                />
                <ResourceCountTable
                  title="Resources by Type"
                  data={resourceCountData.by_resource_type}
                  isLoading={resourceCountLoading}
                />
                <ResourceCountTable
                  title="Resources by Bill Type"
                  data={resourceCountData.by_bill_type}
                  isLoading={resourceCountLoading}
                />
                <ResourceCountTable
                  title="Resources by Expertise"
                  data={resourceCountData.by_expertise_type}
                  isLoading={resourceCountLoading}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
