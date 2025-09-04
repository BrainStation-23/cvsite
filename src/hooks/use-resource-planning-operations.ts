import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResourcePlanningData {
  profile_id: string;
  project_id?: string;
  bill_type_id?: string;
  engagement_percentage: number;
  billing_percentage?: number;
  engagement_start_date?: string;
  release_date?: string;
  engagement_complete?: boolean;
  weekly_validation?: boolean;
  forecasted_project?: string;
}

interface UpdateResourcePlanningData {
  id: string;
  updates: Partial<ResourcePlanningData>;
}

export const useResourcePlanningOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createResourcePlanning = useMutation({
    mutationFn: async (data: ResourcePlanningData) => {
      const { data: result, error } = await supabase
        .from('resource_planning')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      queryClient.invalidateQueries({ queryKey: ['resource-calendar-data'] });
      queryClient.invalidateQueries({ queryKey: ['unplanned-resources'] });
    },
  });

  const updateResourcePlanning = useMutation({
    mutationFn: async ({ id, updates }: UpdateResourcePlanningData) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      queryClient.invalidateQueries({ queryKey: ['resource-calendar-data'] });
      queryClient.invalidateQueries({ queryKey: ['unplanned-resources'] });
    },
  });

  const invalidateResourcePlanning = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      queryClient.invalidateQueries({ queryKey: ['resource-calendar-data'] });
      toast({
        title: 'Success',
        description: 'Resource assignment invalidated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to invalidate resource assignment.',
        variant: 'destructive',
      });
    },
  });

  const deleteResourcePlanning = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
      queryClient.invalidateQueries({ queryKey: ['resource-calendar-data'] });
      queryClient.invalidateQueries({ queryKey: ['unplanned-resources'] });
      toast({
        title: 'Success',
        description: 'Resource assignment deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete resource assignment.',
        variant: 'destructive',
      });
    },
  });

  return {
    createResourcePlanning: createResourcePlanning.mutate,
    updateResourcePlanning: updateResourcePlanning.mutate,
    invalidateResourcePlanning: invalidateResourcePlanning.mutate,
    deleteResourcePlanning: deleteResourcePlanning.mutate,
    isCreating: createResourcePlanning.isPending,
    isUpdating: updateResourcePlanning.isPending,
    isInvalidating: invalidateResourcePlanning.isPending,
    isDeleting: deleteResourcePlanning.isPending,
  };
};
