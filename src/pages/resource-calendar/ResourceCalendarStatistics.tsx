
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { ResourceCountCharts } from '../../components/statistics/ResourceCountCharts';
import { useResourceCountStatistics } from '../../hooks/use-resource-count-statistics';

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  // Fetch data without filters since we're showing all data
  const { data: resourceCountData, isLoading: resourceCountLoading } = useResourceCountStatistics({
    resourceType: null,
    billType: null,
    expertiseType: null,
    sbu: null,
    startDate: null,
    endDate: null,
  });

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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Resource Calendar Statistics
            </h1>
            <p className="text-muted-foreground">Analytics and insights for resource planning</p>
          </div>
        </div>

        {/* Statistics Content */}
        <div className="mt-6">
          {resourceCountData && (
            <ResourceCountCharts data={resourceCountData} isLoading={resourceCountLoading} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
