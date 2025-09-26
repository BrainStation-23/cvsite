
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Search, X } from 'lucide-react';

interface CompactSearchHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const CompactSearchHeader: React.FC<CompactSearchHeaderProps> = ({
  searchQuery,
  onSearch,
  isLoading
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearchSubmit} className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full text-sm">
            Search
          </Button>
        </form>
    </div>
  );
};

export default CompactSearchHeader;
