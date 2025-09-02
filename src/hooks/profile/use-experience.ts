
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Experience } from '@/types';

export const useExperience = (profileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: experience = [], isLoading } = useQuery({
    queryKey: ['experience', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as Experience[];
    },
    enabled: !!profileId
  });

  const createExperience = useMutation({
    mutationFn: async (newExperience: Omit<Experience, 'id'>) => {
      const { data, error } = await supabase
        .from('experience')
        .insert({
          profile_id: profileId,
          company_name: newExperience.companyName,
          designation: newExperience.designation,
          description: newExperience.description,
          start_date: newExperience.startDate instanceof Date ? newExperience.startDate.toISOString().split('T')[0] : newExperience.startDate,
          end_date: newExperience.endDate ? (newExperience.endDate instanceof Date ? newExperience.endDate.toISOString().split('T')[0] : newExperience.endDate) : null,
          is_current: newExperience.isCurrent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({
        title: 'Success',
        description: 'Experience added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add experience',
        variant: 'destructive',
      });
    },
  });

  const updateExperience = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Experience, 'id'>> }) => {
      const updateData: any = { ...updates };
      if (updateData.startDate) {
        updateData.start_date = updateData.startDate instanceof Date ? updateData.startDate.toISOString().split('T')[0] : updateData.startDate;
        delete updateData.startDate;
      }
      if (updateData.endDate) {
        updateData.end_date = updateData.endDate instanceof Date ? updateData.endDate.toISOString().split('T')[0] : updateData.endDate;
        delete updateData.endDate;
      }
      if (updateData.companyName) {
        updateData.company_name = updateData.companyName;
        delete updateData.companyName;
      }

      const { data, error } = await supabase
        .from('experience')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({
        title: 'Success',
        description: 'Experience updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update experience',
        variant: 'destructive',
      });
    },
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({
        title: 'Success',
        description: 'Experience deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete experience',
        variant: 'destructive',
      });
    },
  });

  return {
    experience,
    isLoading,
    createExperience,
    updateExperience,
    deleteExperience,
    isCreating: createExperience.isPending,
    isUpdating: updateExperience.isPending,
    isDeleting: deleteExperience.isPending,
  };
};
