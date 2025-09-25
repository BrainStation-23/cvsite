import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { Badge } from '@/components/ui/badge';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const STORAGE_KEY = 'resource-calendar/planning/basic-filters';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

type CacheShape = {
  searchQuery?: string;
  selectedSbu?: string | null;
  selectedManager?: string | null;
  activeTab?: string | null;
  cachedAt?: number; // timestamp
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readCache(): CacheShape {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed.cachedAt || Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      // Cache expired
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeCache(next: CacheShape) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...next, cachedAt: Date.now() })
    );
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

interface ResourcePlanningFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbu: string | null;
  setSelectedSbu: (sbu: string | null) => void;
  selectedManager: string | null;
  setSelectedManager: (manager: string | null) => void;
  clearFilters: () => void;
  showAdvancedFilters?: boolean;
  activeTab?: string;
  children?: React.ReactNode;
}

export const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSbu,
  setSelectedSbu,
  selectedManager,
  setSelectedManager,
  clearFilters,
  showAdvancedFilters = false,
  activeTab,
  children,
}) => {
  const hasActiveFilters = selectedSbu || selectedManager || searchQuery;
  const isUnplannedTab = activeTab === 'unplanned';
  const [isOpen, setIsOpen] = React.useState(true);

  // 1) Hydrate from cache on mount
  useEffect(() => {
    const cached = readCache();

    if (typeof cached.searchQuery === 'string' && cached.searchQuery !== searchQuery) {
      setSearchQuery(cached.searchQuery);
    }
    if (cached.selectedSbu !== undefined && cached.selectedSbu !== selectedSbu) {
      setSelectedSbu(cached.selectedSbu ?? null);
    }
    if (cached.selectedManager !== undefined && cached.selectedManager !== selectedManager) {
      setSelectedManager(cached.selectedManager ?? null);
    }
    // If parent uses activeTab as a controlled prop from higher up, we just store it below.
    // If you also want to hydrate activeTab, pass a setter and do it similarly here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // 2) Persist whenever inputs change
  const cacheValue: CacheShape = useMemo(
    () => ({
      searchQuery,
      selectedSbu,
      selectedManager,
      activeTab: activeTab ?? null,
    }),
    [searchQuery, selectedSbu, selectedManager, activeTab]
  );

  useEffect(() => {
    writeCache(cacheValue);
  }, [cacheValue]);

  // 3) Clear cache together with UI state
  const handleClearAll = () => {
    clearCache();
    clearFilters();
  };

  return (
    <>
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label className="text-sm font-medium">Basic Filters</Label>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 px-2 text-xs"
                  >
                    Clear all
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search</Label>
                <Input
                  id="search-query"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sbu-filter">Filter by SBU</Label>
                <SbuCombobox
                  value={selectedSbu}
                  onValueChange={setSelectedSbu}
                  placeholder="Select SBU..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager-filter">Filter by Manager</Label>
                <ProfileCombobox
                  value={selectedManager}
                  onValueChange={setSelectedManager}
                  placeholder="Select manager..."
                  label="Manager"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedSbu && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    SBU Filter
                    <button
                      onClick={() => setSelectedSbu(null)}
                      className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedManager && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Manager Filter
                    <button
                      onClick={() => setSelectedManager(null)}
                      className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
           
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
     {/* Conditionally render advanced filters with disabled state for unplanned resources */}
    {children && (
      <div className={isUnplannedTab ? 'opacity-50 pointer-events-none' : ''}>
        {isUnplannedTab && (
          <div className="mb-2 text-sm text-muted-foreground">
            Advanced filters are not available for unplanned resources
          </div>
        )}
        {children}
      </div>
    )}
    </>
  );
};
