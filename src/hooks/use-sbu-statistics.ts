
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DistributionData {
  name: string;
  count: number;
}

interface SummaryStats {
  totalResources: number;
  activeProjects: number;
  avgEngagementPercentage: number;
}

export function useSbuBillTypesDistribution(sbuId: string | null) {
  return useQuery({
    queryKey: ['sbu-bill-types-distribution', sbuId],
    queryFn: async (): Promise<DistributionData[]> => {
      const { data, error } = await supabase.rpc('get_sbu_resource_distribution_by_bill_types', {
        sbu_filter: sbuId
      });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        name: item.bill_type,
        count: Number(item.count)
      }));
    }
  });
}

export function useSbuResourceTypesDistribution(sbuId: string | null) {
  return useQuery({
    queryKey: ['sbu-resource-types-distribution', sbuId],
    queryFn: async (): Promise<DistributionData[]> => {
      const { data, error } = await supabase.rpc('get_sbu_resource_distribution_by_resource_types', {
        sbu_filter: sbuId
      });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        name: item.resource_type,
        count: Number(item.count)
      }));
    }
  });
}

export function useSbuProjectTypesDistribution(sbuId: string | null) {
  return useQuery({
    queryKey: ['sbu-project-types-distribution', sbuId],
    queryFn: async (): Promise<DistributionData[]> => {
      const { data, error } = await supabase.rpc('get_sbu_resource_distribution_by_project_types', {
        sbu_filter: sbuId
      });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        name: item.project_type,
        count: Number(item.count)
      }));
    }
  });
}

export function useSbuExpertiseTypesDistribution(sbuId: string | null) {
  return useQuery({
    queryKey: ['sbu-expertise-types-distribution', sbuId],
    queryFn: async (): Promise<DistributionData[]> => {
      const { data, error } = await supabase.rpc('get_sbu_resource_distribution_by_expertise_types', {
        sbu_filter: sbuId
      });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        name: item.expertise_type,
        count: Number(item.count)
      }));
    }
  });
}

export function useSbuSummaryStats(sbuId: string | null) {
  return useQuery({
    queryKey: ['sbu-summary-stats', sbuId],
    queryFn: async (): Promise<SummaryStats> => {
      const { data, error } = await supabase.rpc('get_sbu_summary_stats', {
        sbu_filter: sbuId
      });
      
      if (error) throw error;
      
      const result = data?.[0];
      return {
        totalResources: Number(result?.total_resources || 0),
        activeProjects: Number(result?.active_projects || 0),
        avgEngagementPercentage: Number(result?.avg_engagement_percentage || 0)
      };
    }
  });
}
