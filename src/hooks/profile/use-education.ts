
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface EducationItem {
  id: string;
  university: string;
  degree: string;
  department: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: string | null;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface EducationFormData {
  university: string;
  degree: string;
  department?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  gpa?: string | null;
}

export const useEducation = (profileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const targetProfileId = profileId || user?.id;

  const addEducationMutation = useMutation({
    mutationFn: async (educationData: EducationFormData) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('education')
        .insert({
          ...educationData,
          profile_id: targetProfileId,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast({
        title: "Education added",
        description: "Your education has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add education: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, educationData }: { id: string; educationData: Partial<EducationFormData> }) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('education')
        .update(educationData)
        .eq('id', id)
        .eq('profile_id', targetProfileId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast({
        title: "Education updated",
        description: "Your education has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update education: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast({
        title: "Education removed",
        description: "Your education has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove education: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  return {
    saveEducation: async (educationData: EducationFormData) => {
      try {
        await addEducationMutation.mutateAsync(educationData);
        return true;
      } catch {
        return false;
      }
    },
    updateEducation: async (id: string, educationData: Partial<EducationFormData>) => {
      try {
        await updateEducationMutation.mutateAsync({ id, educationData });
        return true;
      } catch {
        return false;
      }
    },
    deleteEducation: async (id: string) => {
      try {
        await deleteEducationMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    isLoading: addEducationMutation.isPending || updateEducationMutation.isPending || deleteEducationMutation.isPending,
    isSaving: addEducationMutation.isPending || updateEducationMutation.isPending,
  };
};
