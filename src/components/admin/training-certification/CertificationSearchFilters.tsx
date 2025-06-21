
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

interface CertificationSearchFiltersProps {
  searchQuery: string;
  providerFilter: string;
  sbuFilter: string;
  onSearchChange: (query: string) => void;
  onProviderFilterChange: (provider: string) => void;
  onSbuFilterChange: (sbu: string) => void;
  onClearFilters: () => void;
}

export const CertificationSearchFilters: React.FC<CertificationSearchFiltersProps> = ({
  searchQuery,
  providerFilter,
  sbuFilter,
  onSearchChange,
  onProviderFilterChange,
  onSbuFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchQuery || (providerFilter && providerFilter !== 'all') || (sbuFilter && sbuFilter !== 'all');

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search certifications, employees, or SBUs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-9"
        />
      </div>
      
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        
        <Select value={providerFilter || 'all'} onValueChange={onProviderFilterChange}>
          <SelectTrigger className="w-36 h-8">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="ISTQB">ISTQB</SelectItem>
            <SelectItem value="Scrum.org">Scrum.org</SelectItem>
            <SelectItem value="PMP">PMP</SelectItem>
            <SelectItem value="AWS">AWS</SelectItem>
            <SelectItem value="Microsoft">Microsoft</SelectItem>
            <SelectItem value="Google">Google</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sbuFilter || 'all'} onValueChange={onSbuFilterChange}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="SBU" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SBUs</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="QA">QA</SelectItem>
            <SelectItem value="DevOps">DevOps</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
