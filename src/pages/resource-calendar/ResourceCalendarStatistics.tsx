
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

  // State for filters
  const [filters, setFilters] = useState({
    resourceType: null as string | null,
    billType: null as string | null,
    expertiseType: null as string | null,
    sbu: null as string | null,
  });

  // Add state for group by dimension
  const [groupBy, setGroupBy] = useState<'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType'>('all');

  // Add state for view toggles
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(false);

  console.log('Current filters state:', filters);
  console.log('Current groupBy state:', groupBy);

  // Fetch data with current filters
  const { data: resourceCountData, isLoading: resourceCountLoading } = useResourceCountStatistics(filters);

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('Filters changing from:', filters, 'to:', newFilters);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      resourceType: null,
      billType: null,
      expertiseType: null,
      sbu: null,
    });
    setGroupBy('all');
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
    
    const hasSpecificFilter = filters.sbu || filters.resourceType || filters.billType || filters.expertiseType;
    
    if (groupBy === 'sbu') {
      return hasSpecificFilter && filters.sbu 
        ? `SBU-focused view (${filters.sbu})` 
        : 'SBU-focused view across all SBUs';
    }
    if (groupBy === 'resourceType') {
      return hasSpecificFilter && filters.resourceType 
        ? `Resource Type view (${filters.resourceType})` 
        : 'Resource Type view across all types';
    }
    if (groupBy === 'billType') {
      return hasSpecificFilter && filters.billType 
        ? `Bill Type view (${filters.billType})` 
        : 'Bill Type view across all bill types';
    }
    if (groupBy === 'expertiseType') {
      return hasSpecificFilter && filters.expertiseType 
        ? `Expertise view (${filters.expertiseType})` 
        : 'Expertise view across all expertise types';
    }
    return 'Organization-wide view across all dimensions';
  };

  return (
    <DashboardLayout>
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
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              resourceCountData={resourceCountData}
              resourceCountLoading={resourceCountLoading}
              groupBy={groupBy}
              showCharts={showCharts}
              showTables={showTables}
            />
          </TabsContent>

          <TabsContent value="pivot" className="mt-6">
            <PivotTableContainer filters={filters} />
          </TabsContent>

          <TabsContent value="weekly-scorecard" className="mt-6">
            <WeeklyScoreCardTab />
          </TabsContent>

          <TabsContent value="resource-changes" className="mt-6">
            <ResourceChangesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
