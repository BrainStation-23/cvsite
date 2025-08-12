
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ResourceCountFilters {
  resourceType?: string | null;
  billType?: string | null;
  expertiseType?: string | null;
  sbu?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ResourceCountStatistics {
  total_resources: number;
  active_engagements: number;
  completed_engagements: number;
  by_resource_type: Array<{ name: string; count: number }>;
  by_bill_type: Array<{ name: string; count: number }>;
  by_expertise_type: Array<{ name: string; count: number }>;
  by_sbu: Array<{ name: string; count: number }>;
}

export function useResourceCountStatistics(filters: ResourceCountFilters = {}) {
  return useQuery({
    queryKey: ['resource-count-statistics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_resource_count_statistics', {
        resource_type_filter: filters.resourceType || null,
        bill_type_filter: filters.billType || null,
        expertise_type_filter: filters.expertiseType || null,
        sbu_filter: filters.sbu || null,
        start_date_filter: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        end_date_filter: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
      });

      if (error) {
        console.error('Error fetching resource count statistics:', error);
        throw error;
      }

      return data as ResourceCountStatistics;
    },
  });
}
