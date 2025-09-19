import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, Filter, RotateCcw, X } from 'lucide-react';
import { BillTypeMultiSelect } from './BillTypeMultiSelect';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { DateRangePickerWithPresets } from './DateRangePickerWithPresets';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import React from 'react';

interface BillTypeChangesFiltersSectionProps {
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    selectedOldBillTypes: string[];
    selectedNewBillTypes: string[];
    selectedSbus: string[];
    selectedProfiles: string[];
  };
  updateFilters: (updates: any) => void;
  clearFilters: () => void;
}

export const BillTypeChangesFiltersSection: React.FC<BillTypeChangesFiltersSectionProps> = ({
  filters,
  updateFilters,
  clearFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasActiveFilters = filters.selectedOldBillTypes.length > 0 || filters.selectedNewBillTypes.length > 0 || filters.selectedSbus.length > 0 || filters.selectedProfiles.length > 0 || filters.startDate || filters.endDate;
  const handleClearAll = () => {
    clearFilters();
  };
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <Label className="text-sm font-medium">Bill Type Changes Filters</Label>
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
            </CardTitle>

          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range */}
              <div className="md:col-span-2 space-y-2" >
                <Label>Date Range</Label>
                <DateRangePickerWithPresets
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onDateRangeChange={({ startDate, endDate }) =>
                    updateFilters({ startDate, endDate })
                  }
                />
              </div>

              {/* From Bill Types Filter */}
              <div className="space-y-2">
                <Label>From Bill Type</Label>
                <BillTypeMultiSelect
                  selectedValues={filters.selectedOldBillTypes}
                  onSelectionChange={(values) => updateFilters({ selectedOldBillTypes: values })}
                  placeholder="Select from bill types..."
                  label="From Bill Type"
                />
              </div>

              {/* To Bill Types Filter */}
              <div className="space-y-2">
                <Label>To Bill Type</Label>
                <BillTypeMultiSelect
                  selectedValues={filters.selectedNewBillTypes}
                  onSelectionChange={(values) => updateFilters({ selectedNewBillTypes: values })}
                  placeholder="Select to bill types..."
                  label="To Bill Type"
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}