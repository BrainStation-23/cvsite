
import React, { useState } from 'react';
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
  groupBy: 'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType';
  onFiltersChange: (filters: any) => void;
  onGroupByChange: (groupBy: 'all' | 'sbu' | 'resourceType' | 'billType' | 'expertiseType') => void;
  onClearFilters: () => void;
}

export const ResourceStatisticsFilters: React.FC<ResourceStatisticsFiltersProps> = ({
  filters,
  groupBy,
  onFiltersChange,
  onGroupByChange,
  onClearFilters
}) => {
  const hasActiveFilter = Object.values(filters).some(value => value !== null && value !== undefined);

  const handleGroupByChange = (dimension: typeof groupBy) => {
    console.log('Group by changed to:', dimension);
    onGroupByChange(dimension);
  };

  const updateFilter = (key: string, value: any) => {
    console.log(`Updating filter ${key} to:`, value);
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const renderConditionalFilter = () => {
    switch (groupBy) {
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

  const handleClearAll = () => {
    onClearFilters();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Group By & Filter
          </CardTitle>
          {(hasActiveFilter || groupBy !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
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
              value={groupBy}
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
          {groupBy !== 'all' && (
            <div className="flex-1">
              {renderConditionalFilter()}
            </div>
          )}
        </div>

        {/* Active Filter Indicator */}
        {(hasActiveFilter || groupBy !== 'all') && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Currently showing: <span className="font-medium text-foreground">
                {groupBy === 'all' && 'All dimensions with breakdowns'}
                {groupBy === 'sbu' && (filters.sbu ? `${filters.sbu} SBU only` : 'All SBUs grouped by SBU')}
                {groupBy === 'resourceType' && (filters.resourceType ? `${filters.resourceType} resources only` : 'All Resource Types grouped by Type')}
                {groupBy === 'billType' && (filters.billType ? `${filters.billType} bill type only` : 'All Bill Types grouped by Bill Type')}
                {groupBy === 'expertiseType' && (filters.expertiseType ? `${filters.expertiseType} expertise only` : 'All Expertise Types grouped by Expertise')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
