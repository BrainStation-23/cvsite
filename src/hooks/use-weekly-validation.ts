
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyValidationParams {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
}

export function useWeeklyValidation(params: WeeklyValidationParams) {
  const { searchQuery, selectedSbu, selectedManager } = params;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weekly-validation', searchQuery, selectedSbu, selectedManager],
    queryFn: async () => {
      console.log('Weekly Validation Query:', {
        searchQuery,
        selectedSbu,
        selectedManager
      });

      const { data: rpcData, error } = await supabase.rpc('get_weekly_validation_data', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 100, // Get all records for now
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('Weekly validation RPC call error:', error);
        throw error;
      }

      console.log('Weekly validation RPC response:', rpcData);
      
      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return (rpcData as any).resource_planning || [];
      }
      
      return [];
    }
  });

  const validateMutation = useMutation({
    mutationFn: async (resourcePlanningId: string) => {
      const { error } = await supabase
        .from('resource_planning')
        .update({ weekly_validation: true })
        .eq('id', resourcePlanningId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
      toast({
        title: 'Success',
        description: 'Resource planning validated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Validation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate resource planning.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<{
        bill_type_id: string;
        project_id: string;
        engagement_percentage: number;
        billing_percentage: number;
        release_date: string;
        engagement_start_date: string;
      }> 
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ['weekly-validation'] });
      toast({
        title: 'Success',
        description: 'Resource planning updated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource planning.',
        variant: 'destructive',
      });
    },
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch,
    validateResourcePlanning: validateMutation.mutate,
    isValidating: validateMutation.isPending,
    updateResourcePlanning: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
