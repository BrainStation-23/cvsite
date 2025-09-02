
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Achievement } from '@/types';

export const useAchievements = (profileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!profileId
  });

  const createAchievement = useMutation({
    mutationFn: async (newAchievement: Omit<Achievement, 'id'>) => {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          profile_id: profileId,
          title: newAchievement.title,
          description: newAchievement.description,
          date: newAchievement.date instanceof Date ? newAchievement.date.toISOString().split('T')[0] : newAchievement.date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({
        title: 'Success',
        description: 'Achievement added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add achievement',
        variant: 'destructive',
      });
    },
  });

  const updateAchievement = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Achievement, 'id'>> }) => {
      const updateData: any = { ...updates };
      if (updateData.date) {
        updateData.date = updateData.date instanceof Date ? updateData.date.toISOString().split('T')[0] : updateData.date;
      }

      const { data, error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({
        title: 'Success',
        description: 'Achievement updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update achievement',
        variant: 'destructive',
      });
    },
  });

  const deleteAchievement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({
        title: 'Success',
        description: 'Achievement deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete achievement',
        variant: 'destructive',
      });
    },
  });

  return {
    achievements,
    isLoading,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    isCreating: createAchievement.isPending,
    isUpdating: updateAchievement.isPending,
    isDeleting: deleteAchievement.isPending,
  };
};
