
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyScoreCard {
  id: string;
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
        .order('created_at', { ascending: false });

      // Apply date filters if provided
      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
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
  const queryClient = useQueryClient();
  
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
      
      // Invalidate weekly score card queries after calculation
      queryClient.invalidateQueries({ queryKey: ['weekly-score-card'] });
      
      return data;
    },
    enabled: false, // Only run when manually triggered
  });
};

// Hook to delete weekly score card
export const useDeleteWeeklyScoreCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scoreCardId: string) => {
      console.log('Deleting weekly score card:', scoreCardId);
      
      const { error } = await supabase
        .from('weekly_score_card')
        .delete()
        .eq('id', scoreCardId);

      if (error) {
        console.error('Error deleting weekly score card:', error);
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch weekly score card data after deletion
      queryClient.invalidateQueries({ queryKey: ['weekly-score-card'] });
    },
  });
};
