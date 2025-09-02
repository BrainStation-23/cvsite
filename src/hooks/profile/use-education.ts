
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Education } from '@/types';

export const useEducation = (profileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: education = [], isLoading } = useQuery({
    queryKey: ['education', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as Education[];
    },
    enabled: !!profileId
  });

  const createEducation = useMutation({
    mutationFn: async (newEducation: Omit<Education, 'id'>) => {
      const { data, error } = await supabase
        .from('education')
        .insert({
          profile_id: profileId,
          university: newEducation.university,
          degree: newEducation.degree,
          department: newEducation.department,
          gpa: newEducation.gpa,
          start_date: newEducation.startDate instanceof Date ? newEducation.startDate.toISOString().split('T')[0] : newEducation.startDate,
          end_date: newEducation.endDate ? (newEducation.endDate instanceof Date ? newEducation.endDate.toISOString().split('T')[0] : newEducation.endDate) : null,
          is_current: newEducation.isCurrent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({
        title: 'Success',
        description: 'Education added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive',
      });
    },
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Education, 'id'>> }) => {
      const updateData: any = { ...updates };
      if (updateData.startDate) {
        updateData.start_date = updateData.startDate instanceof Date ? updateData.startDate.toISOString().split('T')[0] : updateData.startDate;
        delete updateData.startDate;
      }
      if (updateData.endDate) {
        updateData.end_date = updateData.endDate instanceof Date ? updateData.endDate.toISOString().split('T')[0] : updateData.endDate;
        delete updateData.endDate;
      }

      const { data, error } = await supabase
        .from('education')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({
        title: 'Success',
        description: 'Education updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update education',
        variant: 'destructive',
      });
    },
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({
        title: 'Success',
        description: 'Education deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete education',
        variant: 'destructive',
      });
    },
  });

  return {
    education,
    isLoading,
    createEducation,
    updateEducation,
    deleteEducation,
    isCreating: createEducation.isPending,
    isUpdating: updateEducation.isPending,
    isDeleting: deleteEducation.isPending,
  };
};
