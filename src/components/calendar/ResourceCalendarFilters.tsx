
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Users, Building2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ResourceCalendarFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSbu: string | null;
  onSbuChange: (sbu: string | null) => void;
  selectedManager: string | null;
  onManagerChange: (manager: string | null) => void;
  showUnplanned: boolean;
  onShowUnplannedChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export const ResourceCalendarFilters: React.FC<ResourceCalendarFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedSbu,
  onSbuChange,
  selectedManager,
  onManagerChange,
  showUnplanned,
  onShowUnplannedChange,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || selectedSbu || selectedManager || showUnplanned;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* SBU Filter */}
        <div className="w-full sm:w-48">
          <Select value={selectedSbu || ''} onValueChange={(value) => onSbuChange(value || null)}>
            <SelectTrigger>
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select SBU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All SBUs</SelectItem>
              {/* Add SBU options here */}
            </SelectContent>
          </Select>
        </div>

        {/* Manager Filter */}
        <div className="w-full sm:w-48">
          <Select value={selectedManager || ''} onValueChange={(value) => onManagerChange(value || null)}>
            <SelectTrigger>
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Managers</SelectItem>
              {/* Add manager options here */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Show Unplanned Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="show-unplanned"
            checked={showUnplanned}
            onCheckedChange={onShowUnplannedChange}
          />
          <Label htmlFor="show-unplanned" className="text-sm">
            Show only unplanned resources
          </Label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
