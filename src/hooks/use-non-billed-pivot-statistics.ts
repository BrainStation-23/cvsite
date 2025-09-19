import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PivotStatistics } from './use-resource-pivot-statistics';
import { format } from 'date-fns';

interface NonBilledPivotFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  sbuFilter?: string | null;
  expertiseFilter?: string | null;
  billTypeFilter?: string | null;
}

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
      const result = data as unknown as PivotStatistics;
      
      // Handle the different grand_total structure from non-billed RPC
      const grandTotal = typeof result?.grand_total === 'object' && result.grand_total !== null
        ? (result.grand_total as any).count || 0
        : result?.grand_total || 0;
      
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
      } as PivotStatistics;
    },
  });
}