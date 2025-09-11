
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface ResourceChangesFilters {
  startDate: Date | null;
  endDate: Date | null;
  selectedBillTypes: string[];
  selectedSbus: string[];
  selectedProfiles: string[];
}

interface BillTypeChange {
  id: string;
  profile_id: string;
  old_bill_type_id: string;
  old_bill_type_name: string;
  new_bill_type_id: string;
  new_bill_type_name: string;
  project_id: string;
  project_name: string;
  changed_at: string;
  created_at: string;
  // Profile information
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_joining: string;
  career_start_date: string;
  // SBU information
  sbu_id: string;
  sbu_name: string;
  // Expertise information
  expertise_id: string;
  expertise_name: string;
  // Manager information
  manager_id: string;
  manager_name: string;
  manager_employee_id: string;
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

interface ResourceChangesSummary {
  total_changes: number;
  bill_type_changes: number;
  sbu_changes: number;
  recent_changes_7d: number;
}

export function useResourceChanges() {
  const [filters, setFilters] = useState<ResourceChangesFilters>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    selectedBillTypes: [],
    selectedSbus: [],
    selectedProfiles: [],
  });

  const updateFilters = useCallback((updates: Partial<ResourceChangesFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      selectedBillTypes: [],
      selectedSbus: [],
      selectedProfiles: [],
    });
  }, []);

  // Fetch summary statistics
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['resource-changes-summary', filters.startDate, filters.endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_resource_changes_summary', {
        start_date_param: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_param: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
      });

      if (error) throw error;
      return data as unknown as ResourceChangesSummary;
    },
  });

  // Fetch bill type changes
  const { data: billTypeChanges, isLoading: billTypeChangesLoading } = useQuery({
    queryKey: ['bill-type-changes', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_bill_type_changes', {
        start_date_param: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_param: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        bill_type_ids: filters.selectedBillTypes.length > 0 ? filters.selectedBillTypes : null,
        sbu_ids: filters.selectedSbus.length > 0 ? filters.selectedSbus : null,
        profile_ids: filters.selectedProfiles.length > 0 ? filters.selectedProfiles : null,
      });

      if (error) throw error;
      return (data || []) as BillTypeChange[];
    },
  });

  // Fetch SBU changes
  const { data: sbuChanges, isLoading: sbuChangesLoading } = useQuery({
    queryKey: ['sbu-changes', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sbu_changes', {
        start_date_param: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_param: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        sbu_ids: filters.selectedSbus.length > 0 ? filters.selectedSbus : null,
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
    summary,
    summaryLoading,
    billTypeChanges,
    billTypeChangesLoading,
    sbuChanges,
    sbuChangesLoading,
    isLoading: summaryLoading || billTypeChangesLoading || sbuChangesLoading,
  };
}
