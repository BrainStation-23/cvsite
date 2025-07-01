
import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BarChart3 } from 'lucide-react';

const ResourcePlanning: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Plan and manage employee resources and project assignments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">Team Allocation</CardTitle>
                <Users className="h-10 w-10 text-cvsite-teal" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage team member assignments and availability
              </p>
              <div className="mt-4 text-cvsite-teal hover:text-cvsite-navy dark:hover:text-cvsite-light-blue transition-colors">
                Coming Soon
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">Project Timeline</CardTitle>
                <Calendar className="h-10 w-10 text-cvsite-teal" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage project schedules and deadlines
              </p>
              <div className="mt-4 text-cvsite-teal hover:text-cvsite-navy dark:hover:text-cvsite-light-blue transition-colors">
                Coming Soon
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">Resource Analytics</CardTitle>
                <BarChart3 className="h-10 w-10 text-cvsite-teal" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyze resource utilization and capacity planning
              </p>
              <div className="mt-4 text-cvsite-teal hover:text-cvsite-navy dark:hover:text-cvsite-light-blue transition-colors">
                Coming Soon
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resource Planning Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Resource Planning Module
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This section will help you plan and allocate resources effectively across projects and teams. 
                Features will include team allocation, project timelines, and resource analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResourcePlanning;
