
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

interface ResourcePlanningFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbu: string | null;
  setSelectedSbu: (sbu: string | null) => void;
  selectedManager: string | null;
  setSelectedManager: (manager: string | null) => void;
  clearFilters: () => void;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
  onClearAdvancedFilters: () => void;
}

export const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  advancedFilters,
  onAdvancedFiltersChange,
  onClearAdvancedFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onAdvancedFiltersChange({
      ...advancedFilters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(advancedFilters).some(value => 
    value !== null && value !== '' && value !== undefined
  );

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-type-filter">Bill Type</Label>
                <Select 
                  value={advancedFilters.billTypeFilter || 'all-types'} 
                  onValueChange={(value) => updateFilter('billTypeFilter', value === 'all-types' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bill type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Bill Types</SelectItem>
                    {/* Bill types will be populated from API */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-search">Project Search</Label>
                <Input
                  id="project-search"
                  placeholder="Search projects..."
                  value={advancedFilters.projectSearch}
                  onChange={(e) => updateFilter('projectSearch', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Engagement % Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min %"
                    min="0"
                    max="100"
                    value={advancedFilters.minEngagementPercentage || ''}
                    onChange={(e) => updateFilter('minEngagementPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Max %"
                    min="0"
                    max="100"
                    value={advancedFilters.maxEngagementPercentage || ''}
                    onChange={(e) => updateFilter('maxEngagementPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing % Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min %"
                    min="0"
                    max="100"
                    value={advancedFilters.minBillingPercentage || ''}
                    onChange={(e) => updateFilter('minBillingPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Max %"
                    min="0"
                    max="100"
                    value={advancedFilters.maxBillingPercentage || ''}
                    onChange={(e) => updateFilter('maxBillingPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={advancedFilters.startDateFrom}
                    onChange={(e) => updateFilter('startDateFrom', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={advancedFilters.startDateTo}
                    onChange={(e) => updateFilter('startDateTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={advancedFilters.endDateFrom}
                    onChange={(e) => updateFilter('endDateFrom', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={advancedFilters.endDateTo}
                    onChange={(e) => updateFilter('endDateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClearAdvancedFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
