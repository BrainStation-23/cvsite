
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface BasicSearchBarProps {
  searchQuery: string;
  onChange: (query: string) => void;
  placeholder?: string;
  isLoading: boolean;
}

const BasicSearchBar: React.FC<BasicSearchBarProps> = ({
  searchQuery,
  onChange,
  placeholder = "Search employees by name, ID, skills, company, or any content...",
  isLoading
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onChange('');
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 h-11"
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
      <Button type="submit" disabled={isLoading} className="h-11 px-6">
        Search
      </Button>
    </form>
  );
};

export default BasicSearchBar;
