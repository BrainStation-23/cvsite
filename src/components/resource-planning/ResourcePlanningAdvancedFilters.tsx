
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

interface ResourcePlanningAdvancedFiltersProps {
  advancedFilters: AdvancedFilters;
  setAdvancedFilters: (filters: AdvancedFilters) => void;
  onClearAdvancedFilters: () => void;
}

export const ResourcePlanningAdvancedFilters: React.FC<ResourcePlanningAdvancedFiltersProps> = ({
  advancedFilters,
  setAdvancedFilters,
  onClearAdvancedFilters,
}) => {
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    setAdvancedFilters({
      ...advancedFilters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(advancedFilters).some(value => 
    value !== null && value !== '' && value !== undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bill Type</Label>
            <Select
              value={advancedFilters.billTypeFilter || 'all'}
              onValueChange={(value) => updateFilter('billTypeFilter', value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bill Types</SelectItem>
                <SelectItem value="billable">Billable</SelectItem>
                <SelectItem value="non-billable">Non-Billable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project Search</Label>
            <Input
              placeholder="Search projects..."
              value={advancedFilters.projectSearch}
              onChange={(e) => updateFilter('projectSearch', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Engagement % Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min %"
                min="0"
                max="100"
                value={advancedFilters.minEngagementPercentage || ''}
                onChange={(e) => updateFilter('minEngagementPercentage', 
                  e.target.value ? parseFloat(e.target.value) : null)}
              />
              <Input
                type="number"
                placeholder="Max %"
                min="0"
                max="100"
                value={advancedFilters.maxEngagementPercentage || ''}
                onChange={(e) => updateFilter('maxEngagementPercentage', 
                  e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billing % Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min %"
                min="0"
                max="100"
                value={advancedFilters.minBillingPercentage || ''}
                onChange={(e) => updateFilter('minBillingPercentage', 
                  e.target.value ? parseFloat(e.target.value) : null)}
              />
              <Input
                type="number"
                placeholder="Max %"
                min="0"
                max="100"
                value={advancedFilters.maxBillingPercentage || ''}
                onChange={(e) => updateFilter('maxBillingPercentage', 
                  e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Start Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={advancedFilters.startDateFrom}
                onChange={(e) => updateFilter('startDateFrom', e.target.value)}
              />
              <Input
                type="date"
                value={advancedFilters.startDateTo}
                onChange={(e) => updateFilter('startDateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={advancedFilters.endDateFrom}
                onChange={(e) => updateFilter('endDateFrom', e.target.value)}
              />
              <Input
                type="date"
                value={advancedFilters.endDateTo}
                onChange={(e) => updateFilter('endDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClearAdvancedFilters}>
              Clear Advanced Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
