
import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react';

const ResourceCalendar: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage resource allocations across projects and time periods
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                +3 new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
              <p className="text-xs text-muted-foreground">
                Ready for assignment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar Area - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Calendar View Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  The interactive resource calendar will be implemented here, showing resource 
                  allocations, project timelines, and availability across different time periods.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">Project Alpha Release</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3 days remaining</p>
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">Beta Testing Phase</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1 day overdue</p>
                  </div>
                  <div className="text-red-600 dark:text-red-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">John Doe - Double Booking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Projects A & B overlap</p>
                  </div>
                  <div className="text-orange-600 dark:text-orange-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>No other conflicts detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendar;
