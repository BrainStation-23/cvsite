
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CronConfig {
  schedule: string;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CronResponse {
  success: boolean;
  config?: CronConfig;
  error?: string;
  message?: string;
}

export const useWeeklyScoreCardCron = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current cron job configuration
  const { data, isLoading, error } = useQuery({
    queryKey: ['weekly-score-card-cron-config'],
    queryFn: async () => {
      console.log('Fetching weekly score card cron config...');
      const { data, error } = await supabase.rpc('get_weekly_score_card_cron_config');
      
      if (error) {
        console.error('Error fetching cron config:', error);
        throw error;
      }
      
      console.log('Cron config response:', data);
      return data as CronResponse;
    },
  });

  // Mutation to manage cron job
  const manageCronMutation = useMutation({
    mutationFn: async ({ schedule, enabled }: { schedule: string; enabled: boolean }) => {
      console.log('Managing weekly score card cron job with:', { schedule, enabled });
      const { data, error } = await supabase.rpc('manage_weekly_score_card_cron', {
        p_schedule: schedule,
        p_enabled: enabled
      });

      if (error) {
        console.error('Error managing cron job:', error);
        throw error;
      }

      console.log('Cron management response:', data);
      return data as CronResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-score-card-cron-config'] });
      
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Weekly score card cron job updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update cron job',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      console.error('Cron management error:', error);
      toast({
        title: 'Error',
        description: 'Failed to manage cron job',
        variant: 'destructive',
      });
    },
  });

  return {
    config: data?.config,
    isLoading,
    error,
    updateCronJob: manageCronMutation.mutate,
    isUpdating: manageCronMutation.isPending,
  };
};
