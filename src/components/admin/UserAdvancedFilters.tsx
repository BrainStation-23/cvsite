
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import SbuCombobox from './user/SbuCombobox';
import { ProfileCombobox } from './user/ProfileCombobox';
import ResourceTypeCombobox from './user/ResourceTypeCombobox';
import ExpertiseCombobox from './user/ExpertiseCombobox';

interface UserAdvancedFiltersProps {
  filterSbuId: string | null;
  onFilterSbuId: (sbuId: string | null) => void;
  filterManagerId: string | null;
  onFilterManagerId: (managerId: string | null) => void;
  filterResourceTypeId: string | null;
  onFilterResourceTypeId: (resourceTypeId: string | null) => void;
  filterExpertiseId: string | null;
  onFilterExpertiseId: (expertiseId: string | null) => void;
  filterTotalYears: [number, number];
  onFilterTotalYears: (years: [number, number]) => void;
  filterCompanyYears: [number, number];
  onFilterCompanyYears: (years: [number, number]) => void;
  onApplyFilters: () => void;
  onResetAdvanced: () => void;
  isLoading: boolean;
}

const UserAdvancedFilters: React.FC<UserAdvancedFiltersProps> = ({
  filterSbuId,
  onFilterSbuId,
  filterManagerId,
  onFilterManagerId,
  filterResourceTypeId,
  onFilterResourceTypeId,
  filterExpertiseId,
  onFilterExpertiseId,
  filterTotalYears,
  onFilterTotalYears,
  filterCompanyYears,
  onFilterCompanyYears,
  onApplyFilters,
  onResetAdvanced,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasAdvancedFilters = filterSbuId || filterManagerId || filterResourceTypeId || 
    filterExpertiseId || filterTotalYears[0] > 0 || filterTotalYears[1] < 50 ||
    filterCompanyYears[0] > 0 || filterCompanyYears[1] < 30;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          type="button"
        >
          <span className="flex items-center gap-2">
            Advanced Filters
            {hasAdvancedFilters && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                Active
              </span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4 border rounded-lg p-4 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">SBU</Label>
            <SbuCombobox
              value={filterSbuId}
              onValueChange={onFilterSbuId}
              placeholder="Select SBU..."
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Manager</Label>
            <ProfileCombobox
              value={filterManagerId}
              onValueChange={onFilterManagerId}
              placeholder="Select manager..."
              disabled={isLoading}
              label="Manager"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Resource Type</Label>
            <ResourceTypeCombobox
              value={filterResourceTypeId}
              onValueChange={onFilterResourceTypeId}
              placeholder="Select resource type..."
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Expertise</Label>
            <ExpertiseCombobox
              value={filterExpertiseId}
              onValueChange={onFilterExpertiseId}
              placeholder="Select expertise..."
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Total Experience: {filterTotalYears[0]} - {filterTotalYears[1]} years
            </Label>
            <Slider
              value={filterTotalYears}
              onValueChange={(value) => onFilterTotalYears([value[0], value[1]])}
              max={50}
              min={0}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Company Experience: {filterCompanyYears[0]} - {filterCompanyYears[1]} years
            </Label>
            <Slider
              value={filterCompanyYears}
              onValueChange={(value) => onFilterCompanyYears([value[0], value[1]])}
              max={30}
              min={0}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button onClick={onApplyFilters} disabled={isLoading} className="flex-1">
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={onResetAdvanced} 
            disabled={isLoading}
          >
            Reset Advanced
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UserAdvancedFilters;
