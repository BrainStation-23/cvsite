import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDuplicateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      sourceRoleId, 
      newRoleName 
    }: { 
      sourceRoleId: string; 
      newRoleName?: string;
    }) => {
      const { data, error } = await supabase.rpc('duplicate_custom_role', {
        source_role_id: sourceRoleId,
        new_role_name: newRoleName || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role duplicated successfully with all permissions',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate role',
        variant: 'destructive',
      });
    },
  });
};