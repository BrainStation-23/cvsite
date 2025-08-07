
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

  // Track if this is the initial render
  const isInitialRender = useRef(true);
  const previousFiltersRef = useRef<ResourcePlanningFilters>({});

  // Create stable filter object
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

  // Apply filters when values change (but not on initial render)
  useEffect(() => {
    if (isInitialRender.current) {
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

    // Only apply filters if they have actually changed
    const prevFilters = previousFiltersRef.current;
    const hasChanged = 
      currentFilters.minEngagementPercentage !== prevFilters.minEngagementPercentage ||
      currentFilters.maxEngagementPercentage !== prevFilters.maxEngagementPercentage ||
      currentFilters.minBillingPercentage !== prevFilters.minBillingPercentage ||
      currentFilters.maxBillingPercentage !== prevFilters.maxBillingPercentage ||
      currentFilters.releaseDateFrom?.getTime() !== prevFilters.releaseDateFrom?.getTime() ||
      currentFilters.releaseDateTo?.getTime() !== prevFilters.releaseDateTo?.getTime() ||
      currentFilters.availabilityStatus !== prevFilters.availabilityStatus ||
      currentFilters.currentProjectSearch !== prevFilters.currentProjectSearch;

    if (hasChanged) {
      console.log('Resource planning filters changed, applying:', currentFilters);
      previousFiltersRef.current = { ...currentFilters };
      
      // Use setTimeout to debounce the filter application
      const timeoutId = setTimeout(() => {
        onResourcePlanningFilters(currentFilters);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentFilters, onResourcePlanningFilters]);

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
