import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw } from 'lucide-react';
import { BillTypeMultiSelect } from './BillTypeMultiSelect';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { DateRangePickerWithPresets } from './DateRangePickerWithPresets';

const ResourceChangesFiltersSection = ({
    filters,
    updateFilters,
    clearFilters,
  }) => (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="md:col-span-2">
              <DateRangePickerWithPresets
                startDate={filters.startDate}
                endDate={filters.endDate}
                onDateRangeChange={({ startDate, endDate }) => 
                  updateFilters({ startDate, endDate })
                }
              />
            </div>

            {/* Bill Types Filter */}
            <div className="space-y-2">
              <Label>Bill Types</Label>
              <BillTypeMultiSelect
                selectedValues={filters.selectedBillTypes}
                onSelectionChange={(values) => updateFilters({ selectedBillTypes: values })}
              />
            </div>

            {/* SBUs Filter */}
            <div className="space-y-2">
              <Label>SBUs</Label>
              <SbuMultiSelect
                selectedValues={filters.selectedSbus}
                onSelectionChange={(values) => updateFilters({ selectedSbus: values })}
              />
            </div>

            {/* Profile Filter */}
            <div className="space-y-2">
              <Label>Profile</Label>
              <ProfileCombobox
                value={filters.selectedProfiles[0] || null}
                onValueChange={(value) => updateFilters({ selectedProfiles: value ? [value] : [] })}
                placeholder="Select profile..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

export default ResourceChangesFiltersSection;