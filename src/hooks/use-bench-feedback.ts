import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateBenchFeedbackParams {
  employeeId: string;
  feedback: string;
}

export const useBenchFeedback = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ employeeId, feedback }: UpdateBenchFeedbackParams) => {
      const { data, error } = await supabase.rpc('update_bench_feedback' as any, {
        employee_id_param: employeeId,
        feedback_param: feedback
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch bench data
      queryClient.invalidateQueries({ queryKey: ['bench-data'] });
      
      toast({
        title: 'Success',
        description: 'Bench feedback updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to update bench feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bench feedback. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    updateFeedback: async (employeeId: string, feedback: string) => {
      return updateFeedbackMutation.mutateAsync({ employeeId, feedback });
    },
    isUpdating: updateFeedbackMutation.isPending,
  };
};