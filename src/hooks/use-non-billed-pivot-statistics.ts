import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface NonBilledPivotFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  sbuFilter?: string | null;
  expertiseFilter?: string | null;
  billTypeFilter?: string | null;
}

export interface NonBilledPivotData {
  row_dimension: string;
  col_dimension: string;
  count: number;
  avg_duration: number;
  initial_count: number;
  critical_count: number;
  row_group?: string;
  col_group?: string;
}

export interface NonBilledPivotTotals {
  dimension: string;
  total: number;
  avg_duration: number;
  initial_count: number;
  critical_count: number;
  group_name?: string;
}

export interface NonBilledGrandTotal {
  count: number;
  avg_duration: number;
  initial_count: number;
  critical_count: number;
}

export interface NonBilledGroupInfo {
  row_groups: string[] | null;
  col_groups: string[] | null;
}

export interface NonBilledPivotStatistics {
  pivot_data: NonBilledPivotData[];
  row_totals: NonBilledPivotTotals[];
  col_totals: NonBilledPivotTotals[];
  grand_total: NonBilledGrandTotal;
  dimensions: {
    primary: string;
    secondary: string;
  };
  grouping?: {
    enabled: boolean;
    info: NonBilledGroupInfo;
  };
}

export type NonBilledMetricType = 'count' | 'avg_duration' | 'initial_count' | 'critical_count';

export function useNonBilledPivotStatistics(
  primaryDimension: string = 'sbu',
  secondaryDimension: string = 'bill_type',
  filters: NonBilledPivotFilters = {},
  enableGrouping: boolean = false
) {
  return useQuery({
    queryKey: ['non-billed-pivot-statistics', primaryDimension, secondaryDimension, filters, enableGrouping],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_billed_pivot_statistics_with_grouping', {
        primary_dimension: primaryDimension,
        secondary_dimension: secondaryDimension,
        start_date_filter: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
        end_date_filter: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
        sbu_filter: filters.sbuFilter || null,
        expertise_type_filter: filters.expertiseFilter || null,
        bill_type_filter: filters.billTypeFilter || null,
        enable_grouping: enableGrouping,
      });

      if (error) {
        console.error('Error fetching non-billed pivot statistics:', error);
        throw error;
      }

      // Properly parse the JSON response from the RPC function
      const result = data as unknown as NonBilledPivotStatistics;
      
      // Handle the grand_total structure from non-billed RPC
      const grandTotal = result?.grand_total || {
        count: 0,
        avg_duration: 0,
        initial_count: 0,
        critical_count: 0
      };
      
      // Ensure the data has the expected structure with default values
      return {
        pivot_data: result?.pivot_data || [],
        row_totals: result?.row_totals || [],
        col_totals: result?.col_totals || [],
        grand_total: grandTotal,
        dimensions: result?.dimensions || {
          primary: primaryDimension,
          secondary: secondaryDimension
        },
        grouping: result?.grouping || {
          enabled: enableGrouping,
          info: {
            row_groups: null,
            col_groups: null
          }
        }
      } as NonBilledPivotStatistics;
    },
  });
}