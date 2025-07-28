
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import ResourceCalendarViewComponent from '../../components/calendar/ResourceCalendarView';
import { ResourceCalendarFilters } from '../../components/calendar/ResourceCalendarFilters';
import { usePlannedResources } from '../../hooks/use-planned-resources';

const ResourceCalendarView: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

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
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={baseUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resource Calendar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage resource allocations across projects and time periods
              </p>
            </div>
          </div>
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
        <ResourceCalendarViewComponent 
          searchQuery={searchQuery}
          selectedSbu={selectedSbu}
          selectedManager={selectedManager}
          showUnplanned={showUnplanned}
        />
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarView;
