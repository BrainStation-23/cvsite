
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

type SortColumn = 'name' | 'full_form' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface DepartmentSearchFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  sortBy: SortColumn;
  sortOrder: SortOrder;
  onSortChange: (value: string) => void;
  onReset: () => void;
  isLoading: boolean;
  searchQuery: string | null;
}

const DepartmentSearchFilters: React.FC<DepartmentSearchFiltersProps> = ({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  sortBy,
  sortOrder,
  onSortChange,
  onReset,
  isLoading,
  searchQuery
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
      <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or full form..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  onSearchInputChange('');
                  if (searchQuery) {
                    onReset();
                  }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={onSortChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="full_form-asc">Full Form (A-Z)</SelectItem>
              <SelectItem value="full_form-desc">Full Form (Z-A)</SelectItem>
              <SelectItem value="created_at-desc">Created Date (Newest)</SelectItem>
              <SelectItem value="created_at-asc">Created Date (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
            disabled={!searchQuery && sortBy === 'name' && sortOrder === 'asc'}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSearchFilters;
