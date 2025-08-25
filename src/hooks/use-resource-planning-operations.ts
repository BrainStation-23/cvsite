
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
}

interface UpdateResourcePlanningData {
  id: string;
  updates: Partial<ResourcePlanningData>;
}

interface BulkUpdateResourcePlanningData {
  ids: string[];
  updates: Partial<ResourcePlanningData>;
}

export const useResourcePlanningOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['planned-resources-tab'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-validation-tab'] });
    queryClient.invalidateQueries({ queryKey: ['resource-calendar-data'] });
  };

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
      invalidateQueries();
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
      invalidateQueries();
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
      invalidateQueries();
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

  // Bulk operations
  const bulkDeleteResourcePlanning = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('resource_planning')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      invalidateQueries();
      toast({
        title: 'Success',
        description: `${ids.length} resource assignment${ids.length > 1 ? 's' : ''} deleted successfully.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete resource assignments.',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdateResourcePlanning = useMutation({
    mutationFn: async ({ ids, updates }: BulkUpdateResourcePlanningData) => {
      const { error } = await supabase
        .from('resource_planning')
        .update(updates)
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, { ids }) => {
      invalidateQueries();
      toast({
        title: 'Success',
        description: `${ids.length} resource assignment${ids.length > 1 ? 's' : ''} updated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update resource assignments.',
        variant: 'destructive',
      });
    },
  });

  const bulkCompleteEngagements = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ engagement_complete: true })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      invalidateQueries();
      toast({
        title: 'Success',
        description: `${ids.length} engagement${ids.length > 1 ? 's' : ''} marked as complete.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to complete engagements.',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdateWeeklyValidation = useMutation({
    mutationFn: async ({ ids, validated }: { ids: string[]; validated: boolean }) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: validated })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, { ids, validated }) => {
      invalidateQueries();
      toast({
        title: 'Success',
        description: `${ids.length} item${ids.length > 1 ? 's' : ''} ${validated ? 'validated' : 'unvalidated'} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update weekly validation.',
        variant: 'destructive',
      });
    },
  });

  return {
    createResourcePlanning: createResourcePlanning.mutate,
    updateResourcePlanning: updateResourcePlanning.mutate,
    deleteResourcePlanning: deleteResourcePlanning.mutate,
    bulkDeleteResourcePlanning: bulkDeleteResourcePlanning.mutate,
    bulkUpdateResourcePlanning: bulkUpdateResourcePlanning.mutate,
    bulkCompleteEngagements: bulkCompleteEngagements.mutate,
    bulkUpdateWeeklyValidation: bulkUpdateWeeklyValidation.mutate,
    isCreating: createResourcePlanning.isPending,
    isUpdating: updateResourcePlanning.isPending,
    isDeleting: deleteResourcePlanning.isPending,
    isBulkDeleting: bulkDeleteResourcePlanning.isPending,
    isBulkUpdating: bulkUpdateResourcePlanning.isPending,
    isBulkCompleting: bulkCompleteEngagements.isPending,
    isBulkValidating: bulkUpdateWeeklyValidation.isPending,
  };
};
