
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search certifications, employees, or SBUs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={providerFilter} onValueChange={onProviderFilterChange}>
            <SelectTrigger className="w-40">
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

          <Select value={sbuFilter} onValueChange={onSbuFilterChange}>
            <SelectTrigger className="w-32">
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

          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
