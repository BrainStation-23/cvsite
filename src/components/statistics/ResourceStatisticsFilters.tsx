
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
    if (filters.sbu) return 'sbu';
    if (filters.resourceType) return 'resourceType';
    if (filters.billType) return 'billType';
    if (filters.expertiseType) return 'expertiseType';
    return 'all';
  };

  const currentGroupBy = getCurrentGroupBy();
  const hasActiveFilter = Object.values(filters).some(value => value !== null && value !== undefined);

  const handleGroupByChange = (dimension: GroupByDimension) => {
    // Clear all filters when changing group by dimension
    onClearFilters();
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
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
              value={currentGroupBy}
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
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
