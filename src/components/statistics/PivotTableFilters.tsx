
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table2, X } from 'lucide-react';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import ExpertiseCombobox from '@/components/admin/user/ExpertiseCombobox';

interface PivotTableFiltersProps {
  filters: {
    resourceType?: string | null;
    billType?: string | null;
    expertiseType?: string | null;
    sbu?: string | null;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const PivotTableFilters: React.FC<PivotTableFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const hasActiveFilter = Object.values(filters).some(value => value !== null && value !== undefined && value !== '');

  const updateFilter = (key: string, value: any) => {
    console.log(`Updating pivot filter ${key} to:`, value);
    // Convert empty strings to null to avoid SelectItem value issues
    const filterValue = value === '' ? null : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            Pivot Analysis Filters
          </CardTitle>
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SBU</label>
            <SbuCombobox
              value={filters.sbu || ''}
              onValueChange={(value) => updateFilter('sbu', value)}
              placeholder="Filter by SBU..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Type</label>
            <ResourceTypeCombobox
              value={filters.resourceType || ''}
              onValueChange={(value) => updateFilter('resourceType', value)}
              placeholder="Filter by type..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bill Type</label>
            <BillTypeCombobox
              value={filters.billType || ''}
              onValueChange={(value) => updateFilter('billType', value)}
              placeholder="Filter by bill type..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expertise</label>
            <ExpertiseCombobox
              value={filters.expertiseType || ''}
              onValueChange={(value) => updateFilter('expertiseType', value)}
              placeholder="Filter by expertise..."
            />
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilter && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Active filters:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {filters.sbu && filters.sbu !== '' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    SBU: {filters.sbu}
                  </span>
                )}
                {filters.resourceType && filters.resourceType !== '' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    Type: {filters.resourceType}
                  </span>
                )}
                {filters.billType && filters.billType !== '' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    Bill: {filters.billType}
                  </span>
                )}
                {filters.expertiseType && filters.expertiseType !== '' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    Expertise: {filters.expertiseType}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
