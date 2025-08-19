
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyScoreCard {
  id: string;
  timestamp: string;
  jsonb_record: {
    non_billed_distribution: Array<{ bill_type_name: string; count: number }>;
    billable_distribution: Array<{ bill_type_name: string; count: number }>;
    support_distribution: Array<{ bill_type_name: string; count: number }>;
    timestamp: string;
  };
  billed_count: number;
  non_billed_count: number;
  utilization_rate: number;
  created_at: string;
  updated_at: string;
}

interface UseWeeklyScoreCardOptions {
  startDate?: string;
  endDate?: string;
}

export const useWeeklyScoreCard = (options: UseWeeklyScoreCardOptions = {}) => {
  return useQuery({
    queryKey: ['weekly-score-card', options.startDate, options.endDate],
    queryFn: async () => {
      console.log('Fetching weekly score card data with options:', options);
      
      let query = supabase
        .from('weekly_score_card')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply date filters if provided
      if (options.startDate) {
        query = query.gte('timestamp', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('timestamp', options.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching weekly score card:', error);
        throw error;
      }

      console.log('Weekly score card data:', data);
      return data as WeeklyScoreCard[];
    },
  });
};

// Hook to calculate new weekly score card
export const useCalculateWeeklyScoreCard = () => {
  return useQuery({
    queryKey: ['calculate-weekly-score-card'],
    queryFn: async () => {
      console.log('Calculating new weekly score card...');
      
      const { data, error } = await supabase.rpc('calculate_weekly_score_card');

      if (error) {
        console.error('Error calculating weekly score card:', error);
        throw error;
      }

      console.log('Calculate weekly score card result:', data);
      return data;
    },
    enabled: false, // Only run when manually triggered
  });
};
