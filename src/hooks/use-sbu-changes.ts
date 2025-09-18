import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface SbuChangesFilters {
  startDate: Date | null;
  endDate: Date | null;
  selectedOldSbus: string[];
  selectedNewSbus: string[];
  selectedProfiles: string[];
}

interface SbuChange {
  id: string;
  profile_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  old_sbu_id: string;
  old_sbu_name: string;
  new_sbu_id: string;
  new_sbu_name: string;
  changed_at: string;
  created_at: string;
}

export function useSbuChanges() {
  const [filters, setFilters] = useState<SbuChangesFilters>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    selectedOldSbus: [],
    selectedNewSbus: [],
    selectedProfiles: [],
  });

  const updateFilters = useCallback((updates: Partial<SbuChangesFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      selectedOldSbus: [],
      selectedNewSbus: [],
      selectedProfiles: [],
    });
  }, []);

  // Fetch SBU changes
  const { data: sbuChanges, isLoading: sbuChangesLoading } = useQuery({
    queryKey: ['sbu-changes', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sbu_changes', {
        start_date_param: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_param: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        old_sbu_ids: filters.selectedOldSbus.length > 0 ? filters.selectedOldSbus : null,
        new_sbu_ids: filters.selectedNewSbus.length > 0 ? filters.selectedNewSbus : null,
        profile_ids: filters.selectedProfiles.length > 0 ? filters.selectedProfiles : null,
      });

      if (error) throw error;
      return (data || []) as SbuChange[];
    },
  });

  return {
    filters,
    updateFilters,
    clearFilters,
    sbuChanges,
    sbuChangesLoading,
    isLoading: sbuChangesLoading,
  };
}