
import React , { useEffect }from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProjectLevelCombobox from './ProjectLevelCombobox';
import ProjectBillTypeCombobox from './ProjectBillTypeCombobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter } from 'lucide-react';
import BillTypeCombobox from './BillTypeCombobox';
import ProjectSearchCombobox from './ProjectSearchCombobox';
import DatePicker from '@/components/admin/user/DatePicker';  
import { ProjectTypeCombobox } from '../projects/ProjectTypeCombobox';
import ExpertiseCombobox from '../admin/user/ExpertiseCombobox';

const STORAGE_KEY = 'resource-calendar/planning/advanced-filters';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; 

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
  projectLevelFilter: string | null;
  projectBillTypeFilter: string | null;
  cachedAt?: number; // timestamp
  projectTypeFilter: string | null;
  expertiseFilter: string | null;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readCache(): AdvancedFilters {
  if (!isBrowser()) return {
    billTypeFilter: null,
    projectSearch: '',
    minEngagementPercentage: null,
    maxEngagementPercentage: null,
    minBillingPercentage: null,
    maxBillingPercentage: null,
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    projectLevelFilter: null,
    projectBillTypeFilter: null,
    projectTypeFilter: null,
    expertiseFilter: null,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {
      billTypeFilter: null,
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      projectLevelFilter: null,
      projectBillTypeFilter: null,
      projectTypeFilter: null,
      expertiseFilter: null,
    };
    const parsed = JSON.parse(raw) as AdvancedFilters
       if (!parsed.cachedAt || Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      // Cache expired
      localStorage.removeItem(STORAGE_KEY);
      return {
      billTypeFilter: null,
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      projectLevelFilter: null,
      projectBillTypeFilter: null,
      projectTypeFilter: null,
      expertiseFilter: null,
      };
    }
    return parsed;
  } catch {
    return {
      billTypeFilter: null,
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      projectLevelFilter: null,
      projectBillTypeFilter: null,
      projectTypeFilter: null,
      expertiseFilter: null,
    };
  }
}

function writeCache(next: AdvancedFilters) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({...next, cachedAt: Date.now()}));
  } catch {
    // no-op
  }
}

function clearCache() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

interface AdvancedResourceFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
}

export const AdvancedResourceFilters: React.FC<AdvancedResourceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== '' && value !== undefined
  );

   // Hydrate filters from localStorage
  useEffect(() => {
    const cachedFilters = readCache();
    if (cachedFilters) {
      onFiltersChange(cachedFilters);
    }
  }, [onFiltersChange]);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    writeCache(filters);
  }, [filters]);

  const handleClearAll = () => {
    clearCache();
    onClearFilters();
  };

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
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
                <Label htmlFor="expertise-filter">Expertise</Label>
                <ExpertiseCombobox
                  value={filters.expertiseFilter}
                  onValueChange={(value) => updateFilter('expertiseFilter', value)}
                  placeholder="Select expertise..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-type-filter">Bill Type</Label>
                <BillTypeCombobox
                  value={filters.billTypeFilter}
                  onValueChange={(value) => updateFilter('billTypeFilter', value)}
                  placeholder="Select bill type..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-search">Project Search</Label>
                <ProjectSearchCombobox
                  value={filters.projectSearch}
                  onValueChange={(value) => updateFilter('projectSearch', value || '')}
                  placeholder="Search projects..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-level-filter">Project Level</Label>
                <ProjectLevelCombobox
                  value={filters.projectLevelFilter}
                  onValueChange={(value) => updateFilter('projectLevelFilter', value)}
                  placeholder="Select project level..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-bill-type-filter">Project Bill Type</Label>
                <ProjectBillTypeCombobox
                  value={filters.projectBillTypeFilter}
                  onValueChange={(value) => updateFilter('projectBillTypeFilter', value)}
                  placeholder="Select project bill type..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-bill-type-filter">Project Type</Label>
                <ProjectTypeCombobox
                  value={filters.projectTypeFilter}
                  onValueChange={(value) => updateFilter('projectTypeFilter', value)}
                  placeholder="Select project type..."
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
                    value={filters.minEngagementPercentage || ''}
                    onChange={(e) => updateFilter('minEngagementPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Max %"
                    min="0"
                    max="100"
                    value={filters.maxEngagementPercentage || ''}
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
                    value={filters.minBillingPercentage || ''}
                    onChange={(e) => updateFilter('minBillingPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Max %"
                    min="0"
                    max="100"
                    value={filters.maxBillingPercentage || ''}
                    onChange={(e) => updateFilter('maxBillingPercentage', 
                      e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date Range</Label>
                <div className="flex gap-2">
                  <DatePicker
                    value={filters.startDateFrom}
                    onChange={(val) => updateFilter('startDateFrom', val)}
                    placeholder="From date"
                  />
                  <DatePicker
                    value={filters.startDateTo}
                    onChange={(val) => updateFilter('startDateTo', val)}
                    placeholder="To date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date Range</Label>
                <div className="flex gap-2">
                  <DatePicker
                    value={filters.endDateFrom}
                    onChange={(val) => updateFilter('endDateFrom', val)}
                    placeholder="From date"
                  />
                  <DatePicker
                    value={filters.endDateTo}
                    onChange={(val) => updateFilter('endDateTo', val)}
                    placeholder="To date"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={handleClearAll}>
                  Clear Advanced Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
