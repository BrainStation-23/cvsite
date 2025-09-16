import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { SbuMultiSelect } from '@/components/statistics/SbuMultiSelect';
import { ExpertiseMultiSelect } from '@/components/statistics/ExpertiseMultiSelect';
import { BillTypeMultiSelect } from '@/components/statistics/BillTypeMultiSelect';

interface NonBilledFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbus: string[];
  setSelectedSbus: (sbus: string[]) => void;
  selectedExpertises: string[];
  setSelectedExpertises: (expertises: string[]) => void;
  selectedBillTypes: string[];
  setSelectedBillTypes: (billTypes: string[]) => void;
  clearFilters: () => void;
}

export const NonBilledFilters: React.FC<NonBilledFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSbus,
  setSelectedSbus,
  selectedExpertises,
  setSelectedExpertises,
  selectedBillTypes,
  setSelectedBillTypes,
  clearFilters,
}) => {
  const hasActiveFilters = selectedSbus.length > 0 || selectedExpertises.length > 0 || selectedBillTypes.length > 0 || searchQuery;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Filters</Label>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear all
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search</Label>
            <Input
              id="search-query"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sbu-filter">Filter by SBU</Label>
            <SbuMultiSelect
              selectedValues={selectedSbus}
              onSelectionChange={setSelectedSbus}
              placeholder="Select SBUs..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise-filter">Filter by Expertise</Label>
            <ExpertiseMultiSelect
              selectedValues={selectedExpertises}
              onSelectionChange={setSelectedExpertises}
              placeholder="Select Expertises..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-type-filter">Filter by Bill Type</Label>
            <BillTypeMultiSelect
              selectedValues={selectedBillTypes}
              onSelectionChange={setSelectedBillTypes}
              placeholder="Select Bill Types..."
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedSbus.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedSbus.length} SBU{selectedSbus.length > 1 ? 's' : ''}
                <button
                  onClick={() => setSelectedSbus([])}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedExpertises.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedExpertises.length} Expertise{selectedExpertises.length > 1 ? 's' : ''}
                <button
                  onClick={() => setSelectedExpertises([])}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedBillTypes.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedBillTypes.length} Bill Type{selectedBillTypes.length > 1 ? 's' : ''}
                <button
                  onClick={() => setSelectedBillTypes([])}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};