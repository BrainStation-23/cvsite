
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ExperienceItem {
  id: string;
  company_name: string;
  designation: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExperienceFormData {
  company_name: string;
  designation: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  is_current: boolean;
}

export const useExperience = (profileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const targetProfileId = profileId || user?.id;

  const addExperienceMutation = useMutation({
    mutationFn: async (experience: ExperienceFormData) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('experiences')
        .insert({
          ...experience,
          profile_id: targetProfileId,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast({
        title: "Experience added",
        description: "Your experience has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add experience: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, experience }: { id: string; experience: Partial<ExperienceFormData> }) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('experiences')
        .update(experience)
        .eq('id', id)
        .eq('profile_id', targetProfileId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast({
        title: "Experience updated",
        description: "Your experience has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update experience: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!targetProfileId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast({
        title: "Experience removed",
        description: "Your experience has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove experience: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    },
  });

  return {
    saveExperience: async (experience: ExperienceFormData) => {
      try {
        await addExperienceMutation.mutateAsync(experience);
        return true;
      } catch {
        return false;
      }
    },
    updateExperience: async (id: string, experience: Partial<ExperienceFormData>) => {
      try {
        await updateExperienceMutation.mutateAsync({ id, experience });
        return true;
      } catch {
        return false;
      }
    },
    deleteExperience: async (id: string) => {
      try {
        await deleteExperienceMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    isLoading: addExperienceMutation.isPending || updateExperienceMutation.isPending || deleteExperienceMutation.isPending,
    isSaving: addExperienceMutation.isPending || updateExperienceMutation.isPending,
  };
};
