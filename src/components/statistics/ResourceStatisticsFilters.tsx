import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, X } from 'lucide-react';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import ExpertiseCombobox from '@/components/admin/user/ExpertiseCombobox';

interface ResourceStatisticsFiltersProps {
  filters: {
    resourceType?: string | null;
    billType?: string | null;
    expertiseType?: string | null;
    sbu?: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

type GroupByDimension = 'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType';

export const ResourceStatisticsFilters: React.FC<ResourceStatisticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  // Determine current group by dimension based on active filters
  const getCurrentGroupBy = (): GroupByDimension => {
    if (filters.sbu !== null && filters.sbu !== undefined) return 'sbu';
    if (filters.resourceType !== null && filters.resourceType !== undefined) return 'resourceType';
    if (filters.billType !== null && filters.billType !== undefined) return 'billType';
    if (filters.expertiseType !== null && filters.expertiseType !== undefined) return 'expertiseType';
    return 'all';
  };

  const currentGroupBy = getCurrentGroupBy();
  const hasActiveFilter = Object.values(filters).some(value => value !== null && value !== undefined);

  const handleGroupByChange = (dimension: GroupByDimension) => {
    console.log('Group by changed to:', dimension);
    
    // Clear all filters when changing group by dimension
    const clearedFilters = {
      resourceType: null,
      billType: null,
      expertiseType: null,
      sbu: null,
    };
    
    // If selecting a specific dimension, we keep the filters cleared
    // The user can then optionally set a filter for that dimension
    onFiltersChange(clearedFilters);
  };

  const updateFilter = (key: string, value: any) => {
    console.log(`Updating filter ${key} to:`, value);
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getGroupByDisplayValue = () => {
    switch (currentGroupBy) {
      case 'sbu': return 'sbu';
      case 'resourceType': return 'resourceType';
      case 'billType': return 'billType';
      case 'expertiseType': return 'expertiseType';
      default: return 'all';
    }
  };

  const renderConditionalFilter = () => {
    switch (currentGroupBy) {
      case 'sbu':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter SBU</label>
            <SbuCombobox
              value={filters.sbu}
              onValueChange={(value) => updateFilter('sbu', value)}
              placeholder="Select specific SBU..."
            />
          </div>
        );
      case 'resourceType':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter Resource Type</label>
            <ResourceTypeCombobox
              value={filters.resourceType}
              onValueChange={(value) => updateFilter('resourceType', value)}
              placeholder="Select specific type..."
            />
          </div>
        );
      case 'billType':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter Bill Type</label>
            <BillTypeCombobox
              value={filters.billType}
              onValueChange={(value) => updateFilter('billType', value)}
              placeholder="Select specific bill type..."
            />
          </div>
        );
      case 'expertiseType':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter Expertise</label>
            <ExpertiseCombobox
              value={filters.expertiseType}
              onValueChange={(value) => updateFilter('expertiseType', value)}
              placeholder="Select specific expertise..."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Group By & Filter
          </CardTitle>
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Group By Selector */}
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Group By</label>
            <Select
              value={getGroupByDisplayValue()}
              onValueChange={handleGroupByChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grouping..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dimensions</SelectItem>
                <SelectItem value="sbu">SBU</SelectItem>
                <SelectItem value="resourceType">Resource Type</SelectItem>
                <SelectItem value="billType">Bill Type</SelectItem>
                <SelectItem value="expertiseType">Expertise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Filter */}
          {currentGroupBy !== 'all' && (
            <div className="flex-1">
              {renderConditionalFilter()}
            </div>
          )}
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilter && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Currently showing: <span className="font-medium text-foreground">
                {currentGroupBy === 'sbu' && filters.sbu && `${filters.sbu} SBU only`}
                {currentGroupBy === 'resourceType' && filters.resourceType && `${filters.resourceType} resources only`}
                {currentGroupBy === 'billType' && filters.billType && `${filters.billType} bill type only`}
                {currentGroupBy === 'expertiseType' && filters.expertiseType && `${filters.expertiseType} expertise only`}
                {currentGroupBy === 'sbu' && !filters.sbu && 'All SBUs grouped by SBU'}
                {currentGroupBy === 'resourceType' && !filters.resourceType && 'All Resource Types grouped by Type'}
                {currentGroupBy === 'billType' && !filters.billType && 'All Bill Types grouped by Bill Type'}
                {currentGroupBy === 'expertiseType' && !filters.expertiseType && 'All Expertise Types grouped by Expertise'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
