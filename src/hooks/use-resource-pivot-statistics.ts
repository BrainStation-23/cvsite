
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PivotFilters {
  resourceType?: string | null;
  billType?: string | null;
  expertiseType?: string | null;
  sbu?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PivotData {
  row_dimension: string;
  col_dimension: string;
  count: number;
}

export interface PivotTotals {
  dimension: string;
  total: number;
}

export interface PivotStatistics {
  pivot_data: PivotData[];
  row_totals: PivotTotals[];
  col_totals: PivotTotals[];
  grand_total: number;
  dimensions: {
    primary: string;
    secondary: string;
  };
}

export function useResourcePivotStatistics(
  primaryDimension: string = 'sbu',
  secondaryDimension: string = 'bill_type',
  filters: PivotFilters = {}
) {
  return useQuery({
    queryKey: ['resource-pivot-statistics', primaryDimension, secondaryDimension, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_resource_pivot_statistics', {
        primary_dimension: primaryDimension,
        secondary_dimension: secondaryDimension,
        resource_type_filter: filters.resourceType || null,
        bill_type_filter: filters.billType || null,
        expertise_type_filter: filters.expertiseType || null,
        sbu_filter: filters.sbu || null,
        start_date_filter: filters.startDate || null,
        end_date_filter: filters.endDate || null,
      });

      if (error) {
        console.error('Error fetching pivot statistics:', error);
        throw error;
      }

      // Properly parse the JSON response from the RPC function
      const result = data as unknown as PivotStatistics;
      
      // Ensure the data has the expected structure with default values
      return {
        pivot_data: result?.pivot_data || [],
        row_totals: result?.row_totals || [],
        col_totals: result?.col_totals || [],
        grand_total: result?.grand_total || 0,
        dimensions: result?.dimensions || {
          primary: primaryDimension,
          secondary: secondaryDimension
        }
      } as PivotStatistics;
    },
  });
}
