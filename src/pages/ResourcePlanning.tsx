
import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { ResourcePlanningTable } from '../components/resource-planning/ResourcePlanningTable';
import { ResourcePlanningExportButton } from '../components/resource-planning/ResourcePlanningExportButton';

const ResourcePlanning: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage employee resource assignments, project allocations, and engagement planning
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ResourcePlanningExportButton />
          </div>
        </div>

        <ResourcePlanningTable />
      </div>
    </DashboardLayout>
  );
};

export default ResourcePlanning;
