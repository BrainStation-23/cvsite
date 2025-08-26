
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AdvancedProjectFiltersComponent } from './AdvancedProjectFilters';
import { AdvancedProjectFilters } from '@/types/projects';

interface EnhancedProjectsSearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  showInactiveProjects: boolean;
  onShowInactiveProjectsChange: (show: boolean) => void;
  onAddProject: () => void;
  advancedFilters: AdvancedProjectFilters;
  onAdvancedFiltersChange: (filters: AdvancedProjectFilters) => void;
  onClearAdvancedFilters: () => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export const EnhancedProjectsSearchControls: React.FC<EnhancedProjectsSearchControlsProps> = ({
  searchQuery,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  showInactiveProjects,
  onShowInactiveProjectsChange,
  onAddProject,
  advancedFilters,
  onAdvancedFiltersChange,
  onClearAdvancedFilters,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}) => {
  return (
    <div className="space-y-4">
      {/* Main Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, clients, managers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Show Inactive Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactiveProjects}
              onCheckedChange={onShowInactiveProjectsChange}
            />
            <Label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
              Show Inactive
            </Label>
          </div>
        </div>

        {/* Add Project Button */}
        <Button onClick={onAddProject}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Sort and Items Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">Sort by:</Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger id="sort-by" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project_name">Project Name</SelectItem>
              <SelectItem value="client_name">Client Name</SelectItem>
              <SelectItem value="project_manager">Project Manager</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="project_level">Project Level</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="is_active">Status</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="sort-order" className="text-sm whitespace-nowrap">Order:</Label>
          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger id="sort-order" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="items-per-page" className="text-sm whitespace-nowrap">Items per page:</Label>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
            <SelectTrigger id="items-per-page" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedProjectFiltersComponent
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        onClearFilters={onClearAdvancedFilters}
      />
    </div>
  );
};
