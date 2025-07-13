
import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react';
import ResourceCalendarView from '../components/calendar/ResourceCalendarView';
import { ResourceCalendarFilters } from '../components/calendar/ResourceCalendarFilters';
import { usePlannedResources } from '../hooks/use-planned-resources';

const ResourceCalendar: React.FC = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = useState(false);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
  };

  const { data: resourceData, isLoading } = usePlannedResources();

  // Calculate quick stats
  const totalResources = resourceData?.length || 0;
  const activeProjects = new Set(resourceData?.map(r => r.project?.id).filter(Boolean)).size;
  const averageUtilization = resourceData?.length > 0 
    ? Math.round(resourceData.reduce((sum, r) => sum + (r.engagement_percentage || 0), 0) / resourceData.length)
    : 0;
  const availableResources = resourceData?.filter(r => (r.engagement_percentage || 0) < 100).length || 0;

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
              <div className="text-2xl font-bold">{totalResources}</div>
              <p className="text-xs text-muted-foreground">
                Currently planned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                With allocated resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                Across all resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableResources}</div>
              <p className="text-xs text-muted-foreground">
                Under 100% utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <ResourceCalendarFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSbu={selectedSbu}
          onSbuChange={setSelectedSbu}
          selectedManager={selectedManager}
          onManagerChange={setSelectedManager}
          showUnplanned={showUnplanned}
          onShowUnplannedChange={setShowUnplanned}
          onClearFilters={clearFilters}
        />

        {/* Main Calendar */}
        <ResourceCalendarView 
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          showUnplanned={showUnplanned}
        />
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendar;
