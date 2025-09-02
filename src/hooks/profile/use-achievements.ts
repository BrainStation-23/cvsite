import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateAchievementData {
  profile_id: string;
  title: string;
  description?: string;
  date: string | Date;
}

interface UpdateAchievementData {
  title: string;
  description?: string;
  date: string | Date;
}

export const useAchievements = (profileId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchAchievements = async (profileId: string) => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  };

  const { data: achievements, isLoading, isError } = useQuery(
    ['achievements', profileId],
    () => fetchAchievements(profileId as string),
    {
      enabled: !!profileId,
    }
  );

  const createAchievement = useMutation({
    mutationFn: async (data: CreateAchievementData) => {
      const formattedData = {
        ...data,
        date: typeof data.date === 'string' ? data.date : format(data.date, 'yyyy-MM-dd')
      };
      
      const { data: result, error } = await supabase
        .from('achievements')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({
        title: 'Success',
        description: 'Achievement created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create achievement.',
        variant: 'destructive',
      });
    },
  });

  const updateAchievement = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAchievementData }) => {
      const formattedData = {
        ...data,
        date: typeof data.date === 'string' ? data.date : format(data.date, 'yyyy-MM-dd')
      };
      
      const { data: result, error } = await supabase
        .from('achievements')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({
        title: 'Success',
        description: 'Achievement updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update achievement.',
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
        description: 'Achievement deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete achievement.',
        variant: 'destructive',
      });
    },
  });

  return {
    achievements,
    isLoading,
    isError,
    createAchievement: createAchievement.mutate,
    updateAchievement: updateAchievement.mutate,
    deleteAchievement: deleteAchievement.mutate,
    isCreating: createAchievement.isPending,
    isUpdating: updateAchievement.isPending,
    isDeleting: deleteAchievement.isPending,
  };
};
