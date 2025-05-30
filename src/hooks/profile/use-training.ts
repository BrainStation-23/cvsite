
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TrainingItem {
  id: string;
  title: string;
  provider: string;
  certification_date: string;
  description: string | null;
  certificate_url: string | null;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingFormData {
  title: string;
  provider: string;
  certification_date: string;
  description?: string | null;
  certificate_url?: string | null;
}

export const useTraining = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTrainingMutation = useMutation({
    mutationFn: async (training: TrainingFormData) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trainings')
        .insert({
          ...training,
          profile_id: user.id,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      toast({
        title: "Training added",
        description: "Your training has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add training: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, training }: { id: string; training: TrainingFormData }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trainings')
        .update(training)
        .eq('id', id)
        .eq('profile_id', user.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      toast({
        title: "Training updated",
        description: "Your training has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update training: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      toast({
        title: "Training removed",
        description: "Your training has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove training: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  return {
    addTraining: async (training: TrainingFormData) => {
      await addTrainingMutation.mutateAsync(training);
    },
    updateTraining: async (id: string, training: TrainingFormData) => {
      await updateTrainingMutation.mutateAsync({ id, training });
    },
    deleteTraining: async (id: string) => {
      await deleteTrainingMutation.mutateAsync(id);
    },
    isAdding: addTrainingMutation.isPending,
    isUpdating: updateTrainingMutation.isPending,
    isRemoving: deleteTrainingMutation.isPending,
  };
};
