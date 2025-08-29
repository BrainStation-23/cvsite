
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { AdvancedProjectFilters } from '@/types/projects';
import { ProjectTypeCombobox } from './ProjectTypeCombobox';
import { ProjectLevelSelect } from './ProjectLevelSelect';
import { ProjectManagerCombobox } from './ProjectManagerCombobox';

interface AdvancedProjectFiltersProps {
  filters: AdvancedProjectFilters;
  onFiltersChange: (filters: AdvancedProjectFilters) => void;
  onClearFilters: () => void;
}

export const AdvancedProjectFiltersComponent: React.FC<AdvancedProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof AdvancedProjectFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateBudgetRange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : null;
    const currentRange = filters.budgetRange || {};
    
    updateFilter('budgetRange', {
      ...currentRange,
      [type]: numValue
    });
  };

  const updateDateRange = (type: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || {};
    
    updateFilter('dateRange', {
      ...currentRange,
      [type]: value || null
    });
  };

  const hasActiveFilters = !!(
    filters.projectType ||
    filters.projectLevel ||
    filters.budgetRange?.min ||
    filters.budgetRange?.max ||
    filters.projectManager ||
    filters.dateRange?.start ||
    filters.dateRange?.end
  );

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Advanced Filters
                {hasActiveFilters && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearFilters();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Project Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <ProjectTypeCombobox
                value={filters.projectType}
                onValueChange={(value) => updateFilter('projectType', value)}
                placeholder="Select project type"
              />
            </div>

            {/* Project Level Filter */}
            <div className="space-y-2">
              <Label htmlFor="project-level">Project Level</Label>
              <ProjectLevelSelect
                value={filters.projectLevel}
                onValueChange={(value) => updateFilter('projectLevel', value)}
                placeholder="Select project level"
              />
            </div>

            {/* Budget Range Filter */}
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Min budget"
                    value={filters.budgetRange?.min || ''}
                    onChange={(e) => updateBudgetRange('min', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max budget"
                    value={filters.budgetRange?.max || ''}
                    onChange={(e) => updateBudgetRange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Project Manager Filter */}
            <div className="space-y-2">
              <Label htmlFor="project-manager">Project Manager</Label>
              <ProjectManagerCombobox
                value={filters.projectManager}
                onValueChange={(value) => updateFilter('projectManager', value)}
                placeholder="Select project manager"
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Creation Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => updateDateRange('start', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="End date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => updateDateRange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="pt-4">
                <Button variant="outline" onClick={onClearFilters} className="w-full">
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
