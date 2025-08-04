
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Building2, 
  Users, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface UnifiedSearchBarProps {
  searchQuery: string;
  minExperience: number | null;
  maxExperience: number | null;
  availabilityFilter: string | null;
  sbuFilter: string | null;
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    minExperience?: number | null;
    maxExperience?: number | null;
    availability?: string | null;
    sbu?: string | null;
  }) => void;
  onReset: () => void;
  isLoading: boolean;
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  searchQuery,
  minExperience,
  maxExperience,
  availabilityFilter,
  sbuFilter,
  onSearch,
  onFilterChange,
  onReset,
  isLoading
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  const activeFilterCount = [
    minExperience,
    maxExperience,
    availabilityFilter,
    sbuFilter
  ].filter(filter => filter !== null && filter !== undefined).length;

  const searchExamples = [
    "React developer with 5+ years experience",
    "Frontend engineer at Google",
    "Java Spring Boot AWS certified",
    "UI/UX designer available now",
    "Senior full-stack Python Django"
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 space-y-4">
      {/* Main Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search: 'React developer 5+ years', 'AWS certified', 'available frontend engineer'..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10 h-11 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 focus:border-blue-400"
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
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="h-11 px-4 relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border rounded-lg shadow-lg mt-2 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Experience Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Min Experience
                </label>
                <Select
                  value={minExperience?.toString() || "all"}
                  onValueChange={(value) => onFilterChange({ 
                    minExperience: value === "all" ? null : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="0">0+ years</SelectItem>
                    <SelectItem value="1">1+ years</SelectItem>
                    <SelectItem value="3">3+ years</SelectItem>
                    <SelectItem value="5">5+ years</SelectItem>
                    <SelectItem value="8">8+ years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Max Experience
                </label>
                <Select
                  value={maxExperience?.toString() || "all"}
                  onValueChange={(value) => onFilterChange({ 
                    maxExperience: value === "all" ? null : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="2">Up to 2 years</SelectItem>
                    <SelectItem value="5">Up to 5 years</SelectItem>
                    <SelectItem value="8">Up to 8 years</SelectItem>
                    <SelectItem value="15">Up to 15 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Availability
                </label>
                <Select
                  value={availabilityFilter || "all"}
                  onValueChange={(value) => onFilterChange({ 
                    availability: value === "all" ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="engaged">Currently Engaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SBU Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  SBU
                </label>
                <Input
                  placeholder="Filter by SBU..."
                  value={sbuFilter || ''}
                  onChange={(e) => onFilterChange({ sbu: e.target.value || null })}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onReset}
                disabled={activeFilterCount === 0}
                className="text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>

      {/* Search Examples */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center text-xs text-gray-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Try:
          </div>
          {searchExamples.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchInput(example);
                onSearch(example);
              }}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {minExperience && (
            <Badge variant="secondary" className="text-xs">
              Min: {minExperience}+ years
              <button
                onClick={() => onFilterChange({ minExperience: null })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {maxExperience && (
            <Badge variant="secondary" className="text-xs">
              Max: {maxExperience} years
              <button
                onClick={() => onFilterChange({ maxExperience: null })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {availabilityFilter && (
            <Badge variant="secondary" className="text-xs">
              {availabilityFilter}
              <button
                onClick={() => onFilterChange({ availability: null })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sbuFilter && (
            <Badge variant="secondary" className="text-xs">
              SBU: {sbuFilter}
              <button
                onClick={() => onFilterChange({ sbu: null })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;
