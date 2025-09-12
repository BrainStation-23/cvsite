
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Table2, TrendingUp, History } from 'lucide-react';
import { ResourceStatisticsHeader } from '../../components/statistics/ResourceStatisticsHeader';
import { ResourceStatisticsOverview } from '../../components/statistics/ResourceStatisticsOverview';
import { PivotTableContainer } from '../../components/statistics/PivotTableContainer';
import { WeeklyScoreCardTab } from '../../components/statistics/WeeklyScoreCardTab';
import { ResourceChangesTab } from '../../components/statistics/ResourceChangesTab';
import { useResourceCountStatistics } from '../../hooks/use-resource-count-statistics';

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Separate filter states for each tab
  const [overviewFilters, setOverviewFilters] = useState({
    resourceType: null as string | null,
    billType: null as string | null,
    expertiseType: null as string | null,
    sbu: null as string | null,
  });

  const [pivotFilters, setPivotFilters] = useState({
    resourceType: null as string | null,
    billType: null as string | null,
    expertiseType: null as string | null,
    sbu: null as string | null,
  });

  // Add state for group by dimension (only for overview)
  const [groupBy, setGroupBy] = useState<'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType'>('all');

  // Add state for view toggles (only for overview)
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(false);

  console.log('Current overview filters state:', overviewFilters);
  console.log('Current pivot filters state:', pivotFilters);
  console.log('Current groupBy state:', groupBy);

  // Fetch data with overview filters (only for overview tab)
  const { data: resourceCountData, isLoading: resourceCountLoading } = useResourceCountStatistics(overviewFilters);

  const handleOverviewFiltersChange = (newFilters: typeof overviewFilters) => {
    console.log('Overview filters changing from:', overviewFilters, 'to:', newFilters);
    setOverviewFilters(newFilters);
  };

  const handlePivotFiltersChange = (newFilters: typeof pivotFilters) => {
    console.log('Pivot filters changing from:', pivotFilters, 'to:', newFilters);
    setPivotFilters(newFilters);
  };

  const handleClearOverviewFilters = () => {
    console.log('Clearing overview filters');
    setOverviewFilters({
      resourceType: null,
      billType: null,
      expertiseType: null,
      sbu: null,
    });
    setGroupBy('all');
  };

  const handleClearPivotFilters = () => {
    console.log('Clearing pivot filters');
    setPivotFilters({
      resourceType: null,
      billType: null,
      expertiseType: null,
      sbu: null,
    });
  };

  // Get current grouping description
  const getGroupingDescription = () => {
    if (activeTab === 'pivot') {
      return 'Cross-dimensional analysis of resources across different categories';
    }
    if (activeTab === 'weekly-scorecard') {
      return 'Weekly utilization and billing analysis dashboard';
    }
    if (activeTab === 'resource-changes') {
      return 'Track and analyze bill type and SBU changes over time';
    }
    
    const hasSpecificFilter = overviewFilters.sbu || overviewFilters.resourceType || overviewFilters.billType || overviewFilters.expertiseType;
    
    if (groupBy === 'sbu') {
      return hasSpecificFilter && overviewFilters.sbu 
        ? `SBU-focused view (${overviewFilters.sbu})` 
        : 'SBU-focused view across all SBUs';
    }
    if (groupBy === 'resourceType') {
      return hasSpecificFilter && overviewFilters.resourceType 
        ? `Resource Type view (${overviewFilters.resourceType})` 
        : 'Resource Type view across all types';
    }
    if (groupBy === 'billType') {
      return hasSpecificFilter && overviewFilters.billType 
        ? `Bill Type view (${overviewFilters.billType})` 
        : 'Bill Type view across all bill types';
    }
    if (groupBy === 'expertiseType') {
      return hasSpecificFilter && overviewFilters.expertiseType 
        ? `Expertise view (${overviewFilters.expertiseType})` 
        : 'Expertise view across all expertise types';
    }
    return 'Organization-wide view across all dimensions';
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <ResourceStatisticsHeader
          baseUrl={baseUrl}
          groupingDescription={getGroupingDescription()}
          activeTab={activeTab}
          showCharts={showCharts}
          showTables={showTables}
          onToggleCharts={() => setShowCharts(!showCharts)}
          onToggleTables={() => setShowTables(!showTables)}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pivot" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Pivot Analysis
            </TabsTrigger>
            <TabsTrigger value="weekly-scorecard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Score Card
            </TabsTrigger>
            <TabsTrigger value="resource-changes" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Resource Changes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ResourceStatisticsOverview
              filters={overviewFilters}
              onFiltersChange={handleOverviewFiltersChange}
              onClearFilters={handleClearOverviewFilters}
              resourceCountData={resourceCountData}
              resourceCountLoading={resourceCountLoading}
              groupBy={groupBy}
              showCharts={showCharts}
              showTables={showTables}
            />
          </TabsContent>

          <TabsContent value="pivot" className="mt-6">
            <PivotTableContainer 
              filters={pivotFilters}
              onFiltersChange={handlePivotFiltersChange}
              onClearFilters={handleClearPivotFilters}
            />
          </TabsContent>

          <TabsContent value="weekly-scorecard" className="mt-6">
            <WeeklyScoreCardTab />
          </TabsContent>

          <TabsContent value="resource-changes" className="mt-6">
            <ResourceChangesTab />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ResourceCalendarStatistics;
