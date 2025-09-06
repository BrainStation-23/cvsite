import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SbuMetric {
  sbu_id: string;
  sbu_name: string;
  billable_resource_count: number;
  billed_resource_count: number;
  actual_billed: number;
}

interface SbuBillingMetricsData {
  sbu_metrics: SbuMetric[];
  totals: {
    total_billable_resources: number;
    total_billed_resources: number;
    total_actual_billed: number;
  };
}

interface SbuBillingFilters {
  startDate?: string | null;
  endDate?: string | null;
  sbu?: string | null;
}

export function useSbuBillingMetrics(filters: SbuBillingFilters = {}) {
  return useQuery({
    queryKey: ['sbu-billing-metrics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sbu_billing_metrics', {
        start_date_filter: filters.startDate || null,
        end_date_filter: filters.endDate || null,
        sbu_filter: filters.sbu || null,
      });

      if (error) {
        console.error('Error fetching SBU billing metrics:', error);
        throw error;
      }

      return data as unknown as SbuBillingMetricsData;
    },
  });
}