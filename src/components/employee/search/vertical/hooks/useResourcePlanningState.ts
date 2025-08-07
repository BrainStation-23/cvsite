
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface ResourcePlanningFilters {
  minEngagementPercentage?: number | null;
  maxEngagementPercentage?: number | null;
  minBillingPercentage?: number | null;
  maxBillingPercentage?: number | null;
  releaseDateFrom?: Date | null;
  releaseDateTo?: Date | null;
  availabilityStatus?: string | null;
  currentProjectSearch?: string | null;
}

interface UseResourcePlanningStateProps {
  onResourcePlanningFilters: (filters: ResourcePlanningFilters) => void;
}

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const useResourcePlanningState = ({ onResourcePlanningFilters }: UseResourcePlanningStateProps) => {
  const [minEngagementPercentage, setMinEngagementPercentage] = useState<string>('');
  const [maxEngagementPercentage, setMaxEngagementPercentage] = useState<string>('');
  const [minBillingPercentage, setMinBillingPercentage] = useState<string>('');
  const [maxBillingPercentage, setMaxBillingPercentage] = useState<string>('');
  const [releaseDateFrom, setReleaseDateFrom] = useState<Date | null>(null);
  const [releaseDateTo, setReleaseDateTo] = useState<Date | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('all');
  const [currentProjectSearch, setCurrentProjectSearch] = useState<string>('');
  const [isResourcePlanningOpen, setIsResourcePlanningOpen] = useState<boolean>(false);

  // Track if this is the initial render to avoid triggering search on mount
  const isInitialRender = useRef(true);
  const previousFiltersRef = useRef<ResourcePlanningFilters>({});

  // Memoize the current filters to prevent unnecessary re-computations
  const currentFilters = useMemo(() => ({
    minEngagementPercentage: minEngagementPercentage ? parseFloat(minEngagementPercentage) : null,
    maxEngagementPercentage: maxEngagementPercentage ? parseFloat(maxEngagementPercentage) : null,
    minBillingPercentage: minBillingPercentage ? parseFloat(minBillingPercentage) : null,
    maxBillingPercentage: maxBillingPercentage ? parseFloat(maxBillingPercentage) : null,
    releaseDateFrom,
    releaseDateTo,
    availabilityStatus: availabilityStatus || null,
    currentProjectSearch: currentProjectSearch || null,
  }), [
    minEngagementPercentage,
    maxEngagementPercentage,
    minBillingPercentage,
    maxBillingPercentage,
    releaseDateFrom,
    releaseDateTo,
    availabilityStatus,
    currentProjectSearch
  ]);

  // Create a stable debounced function using useMemo
  const debouncedApplyFilters = useMemo(
    () => debounce((filters: ResourcePlanningFilters) => {
      // Only apply filters if they have actually changed
      const prevFilters = previousFiltersRef.current;
      const hasChanged = 
        filters.minEngagementPercentage !== prevFilters.minEngagementPercentage ||
        filters.maxEngagementPercentage !== prevFilters.maxEngagementPercentage ||
        filters.minBillingPercentage !== prevFilters.minBillingPercentage ||
        filters.maxBillingPercentage !== prevFilters.maxBillingPercentage ||
        filters.releaseDateFrom?.getTime() !== prevFilters.releaseDateFrom?.getTime() ||
        filters.releaseDateTo?.getTime() !== prevFilters.releaseDateTo?.getTime() ||
        filters.availabilityStatus !== prevFilters.availabilityStatus ||
        filters.currentProjectSearch !== prevFilters.currentProjectSearch;

      if (hasChanged) {
        console.log('Resource planning filters changed, applying:', filters);
        previousFiltersRef.current = { ...filters };
        onResourcePlanningFilters(filters);
      }
    }, 300),
    [onResourcePlanningFilters] // Only recreate if onResourcePlanningFilters changes
  );

  // Apply filters when values change (but not on initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      // Set initial filters without triggering search
      const initialFilters = {
        minEngagementPercentage: null,
        maxEngagementPercentage: null,
        minBillingPercentage: null,
        maxBillingPercentage: null,
        releaseDateFrom: null,
        releaseDateTo: null,
        availabilityStatus: 'all',
        currentProjectSearch: null,
      };
      
      previousFiltersRef.current = initialFilters;
      onResourcePlanningFilters(initialFilters);
      isInitialRender.current = false;
      return;
    }

    debouncedApplyFilters(currentFilters);
  }, [currentFilters, debouncedApplyFilters, onResourcePlanningFilters]);

  return {
    minEngagementPercentage,
    setMinEngagementPercentage,
    maxEngagementPercentage,
    setMaxEngagementPercentage,
    minBillingPercentage,
    setMinBillingPercentage,
    maxBillingPercentage,
    setMaxBillingPercentage,
    releaseDateFrom,
    setReleaseDateFrom,
    releaseDateTo,
    setReleaseDateTo,
    availabilityStatus,
    setAvailabilityStatus,
    currentProjectSearch,
    setCurrentProjectSearch,
    isResourcePlanningOpen,
    setIsResourcePlanningOpen,
  };
};
