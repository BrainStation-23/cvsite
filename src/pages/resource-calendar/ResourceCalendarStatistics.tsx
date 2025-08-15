
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { ResourceCountCharts } from '../../components/statistics/ResourceCountCharts';
import { ResourceStatisticsFilters } from '../../components/statistics/ResourceStatisticsFilters';
import { useResourceCountStatistics } from '../../hooks/use-resource-count-statistics';

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  // State for filters
  const [filters, setFilters] = useState({
    resourceType: null as string | null,
    billType: null as string | null,
    expertiseType: null as string | null,
    sbu: null as string | null,
  });

  console.log('Current filters state:', filters);

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
  };

  // Get current grouping description
  const getGroupingDescription = () => {
    const hasSpecificFilter = filters.sbu || filters.resourceType || filters.billType || filters.expertiseType;
    
    if (filters.sbu) {
      return hasSpecificFilter && filters.sbu 
        ? `SBU-focused view (${filters.sbu})` 
        : 'SBU-focused view across all SBUs';
    }
    if (filters.resourceType) {
      return hasSpecificFilter && filters.resourceType 
        ? `Resource Type view (${filters.resourceType})` 
        : 'Resource Type view across all types';
    }
    if (filters.billType) {
      return hasSpecificFilter && filters.billType 
        ? `Bill Type view (${filters.billType})` 
        : 'Bill Type view across all bill types';
    }
    if (filters.expertiseType) {
      return hasSpecificFilter && filters.expertiseType 
        ? `Expertise view (${filters.expertiseType})` 
        : 'Expertise view across all expertise types';
    }
    return 'Organization-wide view across all dimensions';
  };

  // Determine current group by dimension
  const getCurrentGroupBy = () => {
    if (filters.sbu !== null) return 'sbu';
    if (filters.resourceType !== null) return 'resourceType';
    if (filters.billType !== null) return 'billType';
    if (filters.expertiseType !== null) return 'expertiseType';
    return 'all';
  };

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
              Resource Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              {getGroupingDescription()}
            </p>
          </div>
        </div>

        {/* Group By & Filtering Controls */}
        <ResourceStatisticsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Statistics Content */}
        <div className="mt-6">
          {resourceCountData && (
            <ResourceCountCharts 
              data={resourceCountData} 
              isLoading={resourceCountLoading}
              filters={filters}
              groupBy={getCurrentGroupBy()}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
