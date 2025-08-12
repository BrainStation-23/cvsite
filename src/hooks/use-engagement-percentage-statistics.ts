
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EngagementFilters {
  resourceType?: string | null;
  billType?: string | null;
  expertiseType?: string | null;
  sbu?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface EngagementPercentageStatistics {
  total_resources: number;
  average_engagement: number;
  average_billing: number;
  engagement_distribution: Array<{ range: string; count: number }>;
  by_resource_type: Array<{ name: string; average_engagement: number; count: number }>;
  by_bill_type: Array<{ name: string; average_engagement: number; count: number }>;
  by_expertise_type: Array<{ name: string; average_engagement: number; count: number }>;
  by_sbu: Array<{ name: string; average_engagement: number; count: number }>;
  over_allocated_resources: Array<{
    profile_id: string;
    name: string;
    engagement_percentage: number;
    resource_type: string;
    sbu: string;
  }>;
}

export function useEngagementPercentageStatistics(filters: EngagementFilters = {}) {
  return useQuery({
    queryKey: ['engagement-percentage-statistics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_engagement_percentage_statistics', {
        resource_type_filter: filters.resourceType || null,
        bill_type_filter: filters.billType || null,
        expertise_type_filter: filters.expertiseType || null,
        sbu_filter: filters.sbu || null,
        start_date_filter: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        end_date_filter: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
      });

      if (error) {
        console.error('Error fetching engagement percentage statistics:', error);
        throw error;
      }

      return data as EngagementPercentageStatistics;
    },
  });
}
