
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface ResourcePlanningSearchControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ResourcePlanningSearchControls: React.FC<ResourcePlanningSearchControlsProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, 500); // 500ms delay

  // Update the actual search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  // Sync input value when external searchQuery changes (e.g., from filters reset)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees, projects, or resource types..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};
