
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface ResourcePlanningFiltersProps {
  selectedSbu: string | null;
  onSbuChange: (sbu: string | null) => void;
  selectedManager: string | null;
  onManagerChange: (manager: string | null) => void;
  showUnplanned: boolean;
  onShowUnplannedChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  selectedSbu,
  onSbuChange,
  selectedManager,
  onManagerChange,
  showUnplanned,
  onShowUnplannedChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedSbu || selectedManager || showUnplanned;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label className="text-sm font-medium">Filters</Label>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sbu-filter">Filter by SBU</Label>
          <SbuCombobox
            value={selectedSbu}
            onValueChange={onSbuChange}
            placeholder="Select SBU..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-filter">Filter by Manager</Label>
          <ProfileCombobox
            value={selectedManager}
            onValueChange={onManagerChange}
            placeholder="Select manager..."
            label="Manager"
          />
        </div>

        <div className="space-y-2">
          <Label>Show Resources</Label>
          <div className="flex flex-col gap-2">
            <Button
              variant={showUnplanned ? "default" : "outline"}
              size="sm"
              onClick={() => onShowUnplannedChange(!showUnplanned)}
              className="justify-start"
            >
              {showUnplanned ? "Showing" : "Show"} Unplanned Resources
            </Button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSbu && (
            <Badge variant="secondary" className="flex items-center gap-1">
              SBU Filter
              <button
                onClick={() => onSbuChange(null)}
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
                onClick={() => onManagerChange(null)}
                className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          {showUnplanned && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Unplanned Only
              <button
                onClick={() => onShowUnplannedChange(false)}
                className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
