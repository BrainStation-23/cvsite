
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

export type SortColumn = 'name' | 'type' | 'created_at';
export type SortOrder = 'asc' | 'desc';

interface UniversitySearchFiltersProps {
  onSearch: (query: string | null) => void;
  onFilterType: (type: string | null) => void;
  onSortChange: (column: SortColumn, order: SortOrder) => void;
  onReset: () => void;
  searchQuery: string | null;
  currentType: string | null;
  sortBy: SortColumn;
  sortOrder: SortOrder;
  isLoading: boolean;
}

const UniversitySearchFilters: React.FC<UniversitySearchFiltersProps> = ({
  onSearch,
  onFilterType,
  onSortChange,
  onReset,
  searchQuery,
  currentType,
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
              placeholder="Search by name or acronyms..."
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
            Filter by Type
          </label>
          <Select
            value={currentType || "all-types"}
            onValueChange={(value) => onFilterType(value === "all-types" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
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
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="type-asc">Type (A-Z)</SelectItem>
              <SelectItem value="type-desc">Type (Z-A)</SelectItem>
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
            disabled={!searchQuery && !currentType && sortBy === 'name' && sortOrder === 'asc'}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UniversitySearchFilters;
