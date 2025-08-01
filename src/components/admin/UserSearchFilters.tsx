
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { UserRole } from '@/types';
import { SortColumn, SortOrder } from '@/hooks/types/user-management';

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
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery || ''}
              onChange={(e) => onSearch(e.target.value || null)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Select
          value={currentRole || 'all'}
          onValueChange={(value) => onFilterRole(value === 'all' ? null : value as UserRole)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={`${sortBy}_${sortOrder}`}
          onValueChange={(value) => {
            const [column, order] = value.split('_') as [SortColumn, SortOrder];
            onSortChange(column, order);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest First</SelectItem>
            <SelectItem value="created_at_asc">Oldest First</SelectItem>
            <SelectItem value="firstName_asc">Name A-Z</SelectItem>
            <SelectItem value="firstName_desc">Name Z-A</SelectItem>
            <SelectItem value="email_asc">Email A-Z</SelectItem>
            <SelectItem value="email_desc">Email Z-A</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default UserSearchFilters;
