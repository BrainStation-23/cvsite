
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Training } from '@/types';

export const useTraining = (profileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: training = [], isLoading } = useQuery({
    queryKey: ['training', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Training[];
    },
    enabled: !!profileId
  });

  const createTraining = useMutation({
    mutationFn: async (newTraining: Omit<Training, 'id'>) => {
      const { data, error } = await supabase
        .from('training')
        .insert({
          profile_id: profileId,
          title: newTraining.title,
          provider: newTraining.provider,
          description: newTraining.description || '',
          date: newTraining.date instanceof Date ? newTraining.date.toISOString().split('T')[0] : newTraining.date,
          certificate_url: newTraining.certificateUrl || '',
          is_renewable: newTraining.isRenewable || false,
          expiry_date: newTraining.expiryDate ? (newTraining.expiryDate instanceof Date ? newTraining.expiryDate.toISOString().split('T')[0] : newTraining.expiryDate) : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({
        title: 'Success',
        description: 'Training added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add training',
        variant: 'destructive',
      });
    },
  });

  const updateTraining = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Training, 'id'>> }) => {
      const updateData: any = { ...updates };
      if (updateData.date) {
        updateData.date = updateData.date instanceof Date ? updateData.date.toISOString().split('T')[0] : updateData.date;
      }
      if (updateData.expiryDate) {
        updateData.expiry_date = updateData.expiryDate instanceof Date ? updateData.expiryDate.toISOString().split('T')[0] : updateData.expiryDate;
        delete updateData.expiryDate;
      }
      if (updateData.certificateUrl !== undefined) {
        updateData.certificate_url = updateData.certificateUrl;
        delete updateData.certificateUrl;
      }
      if (updateData.isRenewable !== undefined) {
        updateData.is_renewable = updateData.isRenewable;
        delete updateData.isRenewable;
      }

      const { data, error } = await supabase
        .from('training')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({
        title: 'Success',
        description: 'Training updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update training',
        variant: 'destructive',
      });
    },
  });

  const deleteTraining = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({
        title: 'Success',
        description: 'Training deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete training',
        variant: 'destructive',
      });
    },
  });

  return {
    training,
    isLoading,
    createTraining,
    updateTraining,
    deleteTraining,
    isCreating: createTraining.isPending,
    isUpdating: updateTraining.isPending,
    isDeleting: deleteTraining.isPending,
  };
};
