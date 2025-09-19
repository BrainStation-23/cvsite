import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, Filter, RotateCcw, X } from 'lucide-react';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { DateRangePickerWithPresets } from './DateRangePickerWithPresets';
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

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
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasActiveFilters = filters.selectedOldSbus.length > 0 || filters.selectedNewSbus.length > 0 || filters.selectedProfiles.length > 0 || filters.startDate || filters.endDate;
  const handleClearAll = () => {
    clearFilters();
  };
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <Label className="text-sm font-medium">SBU Changes Filters</Label>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 px-2 text-xs"
                  >
                    Clear all
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

