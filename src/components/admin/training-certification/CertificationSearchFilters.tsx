import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { useCertificationFilters } from '@/hooks/use-certification-filters';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import ProviderCombobox from './ProviderCombobox'; // You need to create this

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
  const { sbuOptions, providerOptions, isLoading } = useCertificationFilters();
  const hasActiveFilters = searchQuery || (providerFilter && providerFilter !== 'all') || (sbuFilter && sbuFilter !== 'all');

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search certifications, employees, or SBUs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>
          
          {/* Provider Combobox */}
          <div className='w-80'>
            <ProviderCombobox
              value={providerFilter === 'all' ? null : providerFilter}
              onValueChange={val => onProviderFilterChange(val ?? 'all')}
              options={providerOptions}
              isLoading={isLoading}
              placeholder="Select Provider..."
            />
          </div>


          {/* SBU Combobox */}
          <div className='min-w-[400px]'>
            <SbuCombobox
              value={sbuOptions.find(sbu => sbu.name === sbuFilter)?.id ?? null}
              onValueChange={id => {
                const selected = sbuOptions.find(sbu => sbu.id === id);
                onSbuFilterChange(selected ? selected.name : 'all');
              }}
              placeholder="Select SBU..."
              disabled={isLoading}
            />
          </div>


          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
