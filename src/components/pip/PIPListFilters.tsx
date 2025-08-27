
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import ExpertiseCombobox from '@/components/admin/user/ExpertiseCombobox';
import { DesignationCombobox } from '@/components/admin/designation/DesignationCombobox';
import { useSbuSearch } from '@/hooks/use-sbu-search';

interface PIPListFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sbuFilter: string | null;
  onSbuFilterChange: (value: string | null) => void;
  expertiseFilter: string | null;
  onExpertiseFilterChange: (value: string | null) => void;
  managerFilter: string | null;
  onManagerFilterChange: (value: string | null) => void;
  designationFilter: string | null;
  onDesignationFilterChange: (value: string | null) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const PIPListFilters: React.FC<PIPListFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  sbuFilter,
  onSbuFilterChange,
  expertiseFilter,
  onExpertiseFilterChange,
  managerFilter,
  onManagerFilterChange,
  designationFilter,
  onDesignationFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  isLoading = false
}) => {
  const { data: sbuData } = useSbuSearch({
    searchQuery: null,
    page: 1,
    perPage: 100,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const sbus = sbuData?.sbus || [];
  const hasActiveFilters = searchQuery || sbuFilter || expertiseFilter || managerFilter || designationFilter || statusFilter;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search PIPs by employee name, ID, or designation..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* SBU Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">SBU</label>
            <Select value={sbuFilter || 'all'} onValueChange={(value) => onSbuFilterChange(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All SBUs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SBUs</SelectItem>
                {sbus.map((sbu) => (
                  <SelectItem key={sbu.id} value={sbu.id}>
                    {sbu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Manager</label>
            <ProfileCombobox
              value={managerFilter}
              onValueChange={onManagerFilterChange}
              placeholder="Select manager..."
              label="Manager"
            />
          </div>

          {/* Expertise Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Expertise</label>
            <ExpertiseCombobox
              value={expertiseFilter}
              onValueChange={onExpertiseFilterChange}
              placeholder="Select expertise..."
            />
          </div>

          {/* Designation Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Designation</label>
            <DesignationCombobox
              value={designationFilter || ''}
              onValueChange={(value) => onDesignationFilterChange(value || null)}
              placeholder="Select designation..."
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={statusFilter || 'all'} onValueChange={(value) => onStatusFilterChange(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="employee_name">Employee Name</SelectItem>
                  <SelectItem value="start_date">Start Date</SelectItem>
                  <SelectItem value="end_date">End Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑</SelectItem>
                  <SelectItem value="desc">↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
