
import { useState, useEffect } from 'react';

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

export function useResourcePlanningState({ onResourcePlanningFilters }: UseResourcePlanningStateProps) {
  const [minEngagementPercentage, setMinEngagementPercentage] = useState<string>('');
  const [maxEngagementPercentage, setMaxEngagementPercentage] = useState<string>('');
  const [minBillingPercentage, setMinBillingPercentage] = useState<string>('');
  const [maxBillingPercentage, setMaxBillingPercentage] = useState<string>('');
  const [releaseDateFrom, setReleaseDateFrom] = useState<Date | null>(null);
  const [releaseDateTo, setReleaseDateTo] = useState<Date | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('all');
  const [currentProjectSearch, setCurrentProjectSearch] = useState<string>('');
  const [isResourcePlanningOpen, setIsResourcePlanningOpen] = useState(false);

  // Auto-trigger resource planning filters when any state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onResourcePlanningFilters({
        minEngagementPercentage: minEngagementPercentage ? parseInt(minEngagementPercentage) : null,
        maxEngagementPercentage: maxEngagementPercentage ? parseInt(maxEngagementPercentage) : null,
        minBillingPercentage: minBillingPercentage ? parseInt(minBillingPercentage) : null,
        maxBillingPercentage: maxBillingPercentage ? parseInt(maxBillingPercentage) : null,
        releaseDateFrom,
        releaseDateTo,
        availabilityStatus: availabilityStatus !== 'all' ? availabilityStatus : null,
        currentProjectSearch: currentProjectSearch || null,
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    minEngagementPercentage,
    maxEngagementPercentage,
    minBillingPercentage,
    maxBillingPercentage,
    releaseDateFrom,
    releaseDateTo,
    availabilityStatus,
    currentProjectSearch,
    onResourcePlanningFilters
  ]);

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
}
