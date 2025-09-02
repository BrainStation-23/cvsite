import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Experience {
  id: string;
  profile_id: string;
  company_name: string;
  designation?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CreateExperienceData {
  profile_id: string;
  company_name: string;
  designation: string;
  description: string;
  start_date: string | Date;
  end_date?: string | Date;
  is_current: boolean;
}

interface UpdateExperienceData {
  company_name: string;
  designation: string;
  description: string;
  start_date: string | Date;
  end_date?: string | Date;
  is_current: boolean;
}

export const useExperience = (profileId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchExperience = async (profileId: string) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  };

  const {
    data: experience,
    isLoading,
    isError,
  } = useQuery(['experience', profileId], () => {
    if (!profileId) return [];
    return fetchExperience(profileId);
  });

  const createExperience = useMutation({
    mutationFn: async (data: CreateExperienceData) => {
      const formattedData = {
        ...data,
        start_date: typeof data.start_date === 'string' ? data.start_date : format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? (typeof data.end_date === 'string' ? data.end_date : format(data.end_date, 'yyyy-MM-dd')) : undefined
      };
      
      const { data: result, error } = await supabase
        .from('experience')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({
        title: 'Success',
        description: 'Experience record created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create experience record.',
        variant: 'destructive',
      });
    },
  });

  const updateExperience = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExperienceData }) => {
      const formattedData = {
        ...data,
        start_date: typeof data.start_date === 'string' ? data.start_date : format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? (typeof data.end_date === 'string' ? data.end_date : format(data.end_date, 'yyyy-MM-dd')) : undefined
      };
      
      const { data: result, error } = await supabase
        .from('experience')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({
        title: 'Success',
        description: 'Experience record updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update experience record.',
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
        description: 'Experience record deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete experience record.',
        variant: 'destructive',
      });
    },
  });

  return {
    experience,
    isLoading,
    isError,
    createExperience: createExperience.mutate,
    updateExperience: updateExperience.mutate,
    deleteExperience: deleteExperience.mutate,
    isCreating: createExperience.isPending,
    isUpdating: updateExperience.isPending,
    isDeleting: deleteExperience.isPending,
  };
};
