
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { UserRole } from '@/types';
import { SortColumn, SortOrder } from '@/hooks/use-user-management';

interface UserSearchFiltersProps {
  onSearch: (query: string | null) => void;
  onFilterRole: (role: UserRole | null) => void;
  onSortChange: (column: SortColumn, order: SortOrder) => void;
  onReset: () => void;
  searchQuery: string | null;
  currentRole: UserRole | null;
  sortBy: SortColumn;
  sortOrder: SortOrder;
  isLoading: boolean;
}

const UserSearchFilters: React.FC<UserSearchFiltersProps> = ({
  onSearch,
  onFilterRole,
  onSortChange,
  onReset,
  searchQuery,
  currentRole,
  sortBy,
  sortOrder,
  isLoading
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput || null);
  };

  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [SortColumn, SortOrder];
    onSortChange(column, order);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  if (searchQuery) onSearch(null);
                }}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
            Filter by Role
          </label>
          <Select
            value={currentRole || ''}
            onValueChange={(value) => onFilterRole(value as UserRole || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Created Date (Newest)</SelectItem>
              <SelectItem value="created_at-asc">Created Date (Oldest)</SelectItem>
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="first_name-asc">First Name (A-Z)</SelectItem>
              <SelectItem value="first_name-desc">First Name (Z-A)</SelectItem>
              <SelectItem value="last_name-asc">Last Name (A-Z)</SelectItem>
              <SelectItem value="last_name-desc">Last Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
            disabled={!searchQuery && !currentRole && sortBy === 'created_at' && sortOrder === 'desc'}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchFilters;
