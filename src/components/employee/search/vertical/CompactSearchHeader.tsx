
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, X, Sparkles } from 'lucide-react';
import AISearchBar from '../AISearchBar';

interface CompactSearchHeaderProps {
  searchQuery: string;
  searchMode: 'manual' | 'ai';
  onSearchModeChange: (mode: 'manual' | 'ai') => void;
  onSearch: (query: string) => void;
  onAISearch: (filters: any) => void;
  isLoading: boolean;
}

const CompactSearchHeader: React.FC<CompactSearchHeaderProps> = ({
  searchQuery,
  searchMode,
  onSearchModeChange,
  onSearch,
  onAISearch,
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
      {/* Search Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="search-mode" className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Mode
        </Label>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${searchMode === 'manual' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Manual
          </span>
          <Switch
            id="search-mode"
            checked={searchMode === 'ai'}
            onCheckedChange={(checked) => onSearchModeChange(checked ? 'ai' : 'manual')}
          />
          <span className={`text-xs flex items-center gap-1 ${searchMode === 'ai' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
            <Sparkles className="h-3 w-3" />
            AI
          </span>
        </div>
      </div>

      {/* Search Input */}
      {searchMode === 'manual' ? (
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
      ) : (
        <div className="space-y-2">
          <AISearchBar
            onAISearch={onAISearch}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default CompactSearchHeader;
