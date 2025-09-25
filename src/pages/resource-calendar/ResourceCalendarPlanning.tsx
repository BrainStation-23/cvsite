
import React from 'react';
import { ResourcePlanningTable } from '../../components/resource-planning/ResourcePlanningTable';
import { ResourcePlanningExportButton } from '../../components/resource-planning/ResourcePlanningExportButton';
import { ResourcePlanningAuditLogsDialog } from '@/components/resource-planning/ResourcePlanningAuditLogsDialog';
import { BulkResourcePlanningUpdate } from '@/components/resource-planning/BulkResourcePlanningUpdate';
import { useResourcePlanningPermissions }  from '@/hooks/use-resource-planning-permissions';

const ResourceCalendarPlanning: React.FC = () => {
  const permissions = useResourcePlanningPermissions();
  if (!permissions.canRead) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        You do not have permission to view this content.
      </div>
    );
  }       
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          {permissions.showBulkUpdateButton && <BulkResourcePlanningUpdate />}
          {permissions.canRead && <ResourcePlanningExportButton />}
          {permissions.canRead && ( 
            <ResourcePlanningAuditLogsDialog
            params={{ items_per_page: 100, page_number: 1 }}
          />
          )}
        </div>
      </div>
      <ResourcePlanningTable />
    </div>
  );
};

export default ResourceCalendarPlanning;
