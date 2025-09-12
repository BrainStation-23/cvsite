
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ResourcePlanningTable } from '../../components/resource-planning/ResourcePlanningTable';
import { ResourcePlanningExportButton } from '../../components/resource-planning/ResourcePlanningExportButton';
import { ResourcePlanningAuditLogsDialog } from '@/components/resource-planning/ResourcePlanningAuditLogsDialog';

const ResourceCalendarPlanning: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={baseUrl}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resource Calendar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage employee resource assignments, project allocations, and engagement planning
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <ResourcePlanningExportButton />
          <ResourcePlanningAuditLogsDialog
            params={{ items_per_page: 100, page_number: 1 }}
          />
        </div>
      </div>
      <ResourcePlanningTable />
    </div>
  );
};

export default ResourceCalendarPlanning;
