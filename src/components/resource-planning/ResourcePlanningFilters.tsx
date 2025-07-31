
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSBUs } from '@/hooks/use-sbus';
import { useManagers } from '@/hooks/use-managers';
import { ResourcePlanningAdvancedFilters } from './ResourcePlanningAdvancedFilters';

interface ResourcePlanningFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbu: string | null;
  setSelectedSbu: (sbu: string | null) => void;
  selectedManager: string | null;
  setSelectedManager: (manager: string | null) => void;
  clearFilters: () => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
  advancedFilters?: any;
  setAdvancedFilters?: (filters: any) => void;
  onClearAdvancedFilters?: () => void;
}

export const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSbu,
  setSelectedSbu,
  selectedManager,
  setSelectedManager,
  clearFilters,
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  advancedFilters,
  setAdvancedFilters,
  onClearAdvancedFilters,
}) => {
  const { sbus, isLoading: sbusLoading } = useSBUs();
  const { managers, isLoading: managersLoading } = useManagers();

  return (
    <div className="space-y-4">
      {/* Basic Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, employee ID, project, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* SBU Filter */}
        <Select value={selectedSbu || ''} onValueChange={(value) => setSelectedSbu(value || null)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All SBUs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All SBUs</SelectItem>
            {!sbusLoading && sbus.map((sbu) => (
              <SelectItem key={sbu.id} value={sbu.name}>
                {sbu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Manager Filter */}
        <Select value={selectedManager || ''} onValueChange={(value) => setSelectedManager(value || null)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Managers</SelectItem>
            {!managersLoading && managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.full_name}>
                {manager.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Advanced Filters Toggle - only show if onToggleAdvancedFilters is provided */}
          {onToggleAdvancedFilters && (
            <Button
              variant="outline"
              onClick={onToggleAdvancedFilters}
              className="whitespace-nowrap"
            >
              {showAdvancedFilters ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  More Filters
                </>
              )}
            </Button>
          )}

          {/* Clear Filters */}
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && onToggleAdvancedFilters && advancedFilters && setAdvancedFilters && onClearAdvancedFilters && (
        <ResourcePlanningAdvancedFilters
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          onClearAdvancedFilters={onClearAdvancedFilters}
        />
      )}
    </div>
  );
};
