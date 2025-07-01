
import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { ResourcePlanningTable } from '../components/resource-planning/ResourcePlanningTable';

const ResourcePlanning: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage employee resource assignments, project allocations, and engagement planning
          </p>
        </div>

        <ResourcePlanningTable />
      </div>
    </DashboardLayout>
  );
};

export default ResourcePlanning;
