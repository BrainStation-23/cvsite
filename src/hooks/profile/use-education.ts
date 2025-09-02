import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Education {
  id: string;
  profile_id: string;
  university?: string;
  degree?: string;
  department?: string;
  gpa?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CreateEducationData {
  profile_id: string;
  university: string;
  degree: string;
  department: string;
  gpa: string;
  start_date: string | Date;
  end_date?: string | Date;
  is_current: boolean;
}

interface UpdateEducationData {
  university: string;
  degree: string;
  department: string;
  gpa: string;
  start_date: string | Date;
  end_date?: string | Date;
  is_current: boolean;
}

export const useEducation = (profileId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchEducation = async (profileId: string) => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  };

  const { data: education, isLoading, isError } = useQuery(
    ['education', profileId],
    () => fetchEducation(profileId as string),
    {
      enabled: !!profileId,
      retry: false,
    }
  );

  const createEducation = useMutation({
    mutationFn: async (data: CreateEducationData) => {
      const formattedData = {
        ...data,
        start_date: typeof data.start_date === 'string' ? data.start_date : format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? (typeof data.end_date === 'string' ? data.end_date : format(data.end_date, 'yyyy-MM-dd')) : undefined
      };
      
      const { data: result, error } = await supabase
        .from('education')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({
        title: 'Success',
        description: 'Education record created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create education record.',
        variant: 'destructive',
      });
    },
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEducationData }) => {
      const formattedData = {
        ...data,
        start_date: typeof data.start_date === 'string' ? data.start_date : format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? (typeof data.end_date === 'string' ? data.end_date : format(data.end_date, 'yyyy-MM-dd')) : undefined
      };
      
      const { data: result, error } = await supabase
        .from('education')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({
        title: 'Success',
        description: 'Education record updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update education record.',
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
        description: 'Education record deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete education record.',
        variant: 'destructive',
      });
    },
  });

  return {
    education,
    isLoading,
    isError,
    createEducation: createEducation.mutate,
    updateEducation: updateEducation.mutate,
    deleteEducation: deleteEducation.mutate,
    isCreating: createEducation.isPending,
    isUpdating: updateEducation.isPending,
    isDeleting: deleteEducation.isPending,
  };
};
