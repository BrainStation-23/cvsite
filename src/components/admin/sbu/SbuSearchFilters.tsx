
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';

interface SbuSearchFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  isLoading: boolean;
  searchQuery: string | null;
}

const SbuSearchFilters: React.FC<SbuSearchFiltersProps> = ({
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
    <div className="space-y-4">
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search SBUs by name or email..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="sbu_head_email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="sbu_head_email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchQuery && (
          <Button variant="outline" onClick={onReset} size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default SbuSearchFilters;
