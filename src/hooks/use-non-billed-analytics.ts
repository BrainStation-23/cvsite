import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface NonBilledOverviewData {
  overview: {
    total_non_billed_resources_count: number;
    avg_non_billed_resources_duration_days: number;
    max_non_billed_resources_duration_days: number;
    min_non_billed_resources_duration_days: number;
    long_term_non_billed_resources_count: number;
    critical_non_billed_resources_count: number;
    avg_experience_years: number;
  };
  experience_distribution: {
    junior: number;
    mid: number;
    senior: number;
    unknown: number;
  };
  recent_trends: {
    new_non_billed_resources_last_7_days: number;
    new_non_billed_resources_last_30_days: number;
  };
}

interface DimensionalAnalysisData {
  dimension_id: string;
  dimension_name: string;
  total_count: number;
  avg_duration_days: number;
  long_term_count: number;
  avg_experience_years?: number;
  color_code?: string;
}

interface RiskAnalyticsData {
  risk_summary: {
    total_high_risk_count: number;
    critical_risk_count: number;
    unplanned_high_risk_count: number;
    avg_high_risk_duration: number;
    senior_high_risk_count: number;
  };
  high_risk_profiles: Array<{
    profile_id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    sbu_name: string;
    expertise_name: string;
    bill_type_name: string;
    color_code: string;
    non_billed_resources_date: string;
    non_billed_resources_duration_days: number;
    total_years_experience: number;
    non_billed_resources_feedback: string;
    planned_status: string;
  }>;
  top_risk_sbus: Array<{
    sbu_name: string;
    risk_count: number;
    avg_duration: number;
  }>;
}

interface TrendsAnalysisData {
  trends: Array<{
    period: string;
    new_non_billed_resources_count: number;
    affected_sbus: number;
    avg_experience_of_new_non_billed_resources: number;
  }>;
  placement_metrics: {
    avg_days_to_placement: number;
  };
}

interface AnalyticsFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  sbuFilter?: string[] | null;
  expertiseFilter?: string[] | null;
  billTypeFilter?: string[] | null;
}

export function useNonBilledOverview(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['non-billed-overview', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_billed_resources_overview_statistics', {
        start_date_filter: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_filter: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        sbu_filter: filters.sbuFilter?.length ? filters.sbuFilter : null,
        expertise_filter: filters.expertiseFilter?.length ? filters.expertiseFilter : null,
        bill_type_filter: filters.billTypeFilter?.length ? filters.billTypeFilter : null,
      });

      if (error) throw error;
      return data as unknown as NonBilledOverviewData;
    },
  });
}

export function useNonBilledDimensionalAnalysis(
  dimension: 'sbu' | 'expertise' | 'bill_type' = 'sbu',
  filters: Pick<AnalyticsFilters, 'startDate' | 'endDate'> = {}
) {
  return useQuery({
    queryKey: ['non-billed-dimensional-analysis', dimension, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_billed_resources_dimensional_analysis', {
        start_date_filter: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_filter: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        group_by_dimension: dimension,
      });

      if (error) throw error;
      return (data || []) as unknown as DimensionalAnalysisData[];
    },
  });
}

export function useNonBilledRiskAnalytics(riskThresholdDays: number = 30) {
  return useQuery({
    queryKey: ['non-billed-risk-analytics', riskThresholdDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_billed_resources_risk_analytics', {
        risk_threshold_days: riskThresholdDays,
      });

      if (error) throw error;
      return data as unknown as RiskAnalyticsData;
    },
  });
}

export function useNonBilledTrendsAnalysis(
  periodType: 'daily' | 'weekly' | 'monthly' = 'monthly',
  lookbackDays: number = 365
) {
  return useQuery({
    queryKey: ['non-billed-trends-analysis', periodType, lookbackDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_billed_resources_trends_analysis', {
        period_type: periodType,
        lookback_days: lookbackDays,
      });

      if (error) throw error;
      return data as unknown as TrendsAnalysisData;
    },
  });
}