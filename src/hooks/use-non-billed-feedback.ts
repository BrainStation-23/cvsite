import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateNonBilledFeedbackParams {
  employeeId: string;
  feedback: string;
}

export const useNonBilledFeedback = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ employeeId, feedback }: UpdateNonBilledFeedbackParams) => {
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
      queryClient.invalidateQueries({ queryKey: ['non-billed-data'] });
      
      toast({
        title: 'Success',
        description: 'Non-billed feedback updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to update non-billed feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update non-billed feedback. Please try again.',
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