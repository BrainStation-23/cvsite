
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface ResourcePlanningFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbu: string | null;
  setSelectedSbu: (sbu: string | null) => void;
  selectedManager: string | null;
  setSelectedManager: (manager: string | null) => void;
  clearFilters: () => void;
  showAdvancedFilters?: boolean;
  activeTab?: string;
  children?: React.ReactNode;
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
  activeTab,
  children,
}) => {
  const hasActiveFilters = selectedSbu || selectedManager || searchQuery;
  const isUnplannedTab = activeTab === 'unplanned';

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Basic Filters</Label>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <SbuCombobox
              value={selectedSbu}
              onValueChange={setSelectedSbu}
              placeholder="Select SBU..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager-filter">Filter by Manager</Label>
            <ProfileCombobox
              value={selectedManager}
              onValueChange={setSelectedManager}
              placeholder="Select manager..."
              label="Manager"
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
            {selectedSbu && (
              <Badge variant="secondary" className="flex items-center gap-1">
                SBU Filter
                <button
                  onClick={() => setSelectedSbu(null)}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedManager && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Manager Filter
                <button
                  onClick={() => setSelectedManager(null)}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Conditionally render advanced filters with disabled state for unplanned resources */}
      {children && (
        <div className={isUnplannedTab ? 'opacity-50 pointer-events-none' : ''}>
          {isUnplannedTab && (
            <div className="mb-2 text-sm text-muted-foreground">
              Advanced filters are not available for unplanned resources
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};
