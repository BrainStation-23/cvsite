
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, FolderOpen, TrendingUp } from 'lucide-react';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import DonutChart from '@/components/resource-calendar/statistics/DonutChart';
import BarChart from '@/components/resource-calendar/statistics/BarChart';
import SummaryCard from '@/components/resource-calendar/statistics/SummaryCard';
import {
  useSbuBillTypesDistribution,
  useSbuResourceTypesDistribution,
  useSbuProjectTypesDistribution,
  useSbuExpertiseTypesDistribution,
  useSbuSummaryStats
} from '@/hooks/use-sbu-statistics';

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';
  
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);

  // Fetch all statistics data
  const { data: billTypesData, isLoading: billTypesLoading } = useSbuBillTypesDistribution(selectedSbu);
  const { data: resourceTypesData, isLoading: resourceTypesLoading } = useSbuResourceTypesDistribution(selectedSbu);
  const { data: projectTypesData, isLoading: projectTypesLoading } = useSbuProjectTypesDistribution(selectedSbu);
  const { data: expertiseTypesData, isLoading: expertiseTypesLoading } = useSbuExpertiseTypesDistribution(selectedSbu);
  const { data: summaryStats, isLoading: summaryLoading } = useSbuSummaryStats(selectedSbu);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Link to={baseUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resource Calendar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">SBU Resource Statistics</h1>
              <p className="text-muted-foreground">Analytics and insights for resource planning by SBU</p>
            </div>
          </div>
          
          {/* SBU Selector */}
          <div className="w-full sm:w-80">
            <SbuCombobox
              value={selectedSbu}
              onValueChange={setSelectedSbu}
              placeholder="Select SBU (All if none selected)"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Resources"
            value={summaryStats?.totalResources || 0}
            icon={Users}
            description="Active resources in planning"
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Active Projects"
            value={summaryStats?.activeProjects || 0}
            icon={FolderOpen}
            description="Projects with resource allocation"
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Avg Engagement"
            value={`${summaryStats?.avgEngagementPercentage || 0}%`}
            icon={TrendingUp}
            description="Average resource engagement"
            isLoading={summaryLoading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <DonutChart
            data={billTypesData || []}
            title="Distribution by Bill Types"
            isLoading={billTypesLoading}
          />
          
          <BarChart
            data={resourceTypesData || []}
            title="Distribution by Resource Types"
            isLoading={resourceTypesLoading}
          />
          
          <BarChart
            data={projectTypesData || []}
            title="Distribution by Project Types"
            isLoading={projectTypesLoading}
            horizontal={true}
          />
          
          <DonutChart
            data={expertiseTypesData || []}
            title="Distribution by Expertise Types"
            isLoading={expertiseTypesLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
