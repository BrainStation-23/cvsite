import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface BillTypeChangesFilters {
  startDate: Date | null;
  endDate: Date | null;
  selectedOldBillTypes: string[];
  selectedNewBillTypes: string[];
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

export function useBillTypeChanges() {
  const [filters, setFilters] = useState<BillTypeChangesFilters>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    selectedOldBillTypes: [],
    selectedNewBillTypes: [],
    selectedSbus: [],
    selectedProfiles: [],
  });

  const updateFilters = useCallback((updates: Partial<BillTypeChangesFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      selectedOldBillTypes: [],
      selectedNewBillTypes: [],
      selectedSbus: [],
      selectedProfiles: [],
    });
  }, []);

  // Fetch bill type changes
  const { data: billTypeChanges, isLoading: billTypeChangesLoading } = useQuery({
    queryKey: ['bill-type-changes', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_bill_type_changes', {
        start_date_param: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_param: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        old_bill_type_ids: filters.selectedOldBillTypes.length > 0 ? filters.selectedOldBillTypes : null,
        new_bill_type_ids: filters.selectedNewBillTypes.length > 0 ? filters.selectedNewBillTypes : null,
        sbu_ids: filters.selectedSbus.length > 0 ? filters.selectedSbus : null,
        profile_ids: filters.selectedProfiles.length > 0 ? filters.selectedProfiles : null,
      });

      if (error) throw error;
      return (data || []) as BillTypeChange[];
    },
  });

  return {
    filters,
    updateFilters,
    clearFilters,
    billTypeChanges,
    billTypeChangesLoading,
    isLoading: billTypeChangesLoading,
  };
}