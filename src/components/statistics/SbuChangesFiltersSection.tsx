import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw } from 'lucide-react';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { DateRangePickerWithPresets } from './DateRangePickerWithPresets';

interface SbuChangesFiltersSectionProps {
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    selectedOldSbus: string[];
    selectedNewSbus: string[];
    selectedProfiles: string[];
  };
  updateFilters: (updates: any) => void;
  clearFilters: () => void;
}

export const SbuChangesFiltersSection: React.FC<SbuChangesFiltersSectionProps> = ({
  filters,
  updateFilters,
  clearFilters,
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <CardTitle>SBU Changes Filters</CardTitle>
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
        <div className="md:col-span-2 space-y-2">
          <Label>Date Range</Label>
          <DateRangePickerWithPresets
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateRangeChange={({ startDate, endDate }) => 
              updateFilters({ startDate, endDate })
            }
          />
        </div>

        {/* From SBUs Filter */}
        <div className="space-y-2">
          <Label>From SBU</Label>
          <SbuMultiSelect
            selectedValues={filters.selectedOldSbus}
            onSelectionChange={(values) => updateFilters({ selectedOldSbus: values })}
            placeholder="Select from SBUs..."
            label="From SBU"
          />
        </div>

        {/* To SBUs Filter */}
        <div className="space-y-2">
          <Label>To SBU</Label>
          <SbuMultiSelect
            selectedValues={filters.selectedNewSbus}
            onSelectionChange={(values) => updateFilters({ selectedNewSbus: values })}
            placeholder="Select to SBUs..."
            label="To SBU"
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
);