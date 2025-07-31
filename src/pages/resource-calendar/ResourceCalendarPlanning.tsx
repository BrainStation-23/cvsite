
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ResourcePlanningTable } from '../../components/resource-planning/ResourcePlanningTable';

const ResourceCalendarPlanning: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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

        <ResourcePlanningTable />
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarPlanning;
