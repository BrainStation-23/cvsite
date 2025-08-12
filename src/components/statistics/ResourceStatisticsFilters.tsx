
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
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

export const ResourceStatisticsFilters: React.FC<ResourceStatisticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SBU Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">SBU</label>
            <SbuCombobox
              value={filters.sbu}
              onValueChange={(value) => updateFilter('sbu', value)}
              placeholder="All SBUs"
            />
          </div>

          {/* Resource Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Type</label>
            <ResourceTypeCombobox
              value={filters.resourceType}
              onValueChange={(value) => updateFilter('resourceType', value)}
              placeholder="All Types"
            />
          </div>

          {/* Bill Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bill Type</label>
            <BillTypeCombobox
              value={filters.billType}
              onValueChange={(value) => updateFilter('billType', value)}
              placeholder="All Bill Types"
            />
          </div>

          {/* Expertise Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Expertise</label>
            <ExpertiseCombobox
              value={filters.expertiseType}
              onValueChange={(value) => updateFilter('expertiseType', value)}
              placeholder="All Expertise"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
