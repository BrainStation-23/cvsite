
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserDeletion(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const { setIsDeleting } = state;
  
  // Delete user
  const deleteUser = async (userId: string, onSuccess?: () => void) => {
    try {
      setIsDeleting(true);
      
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID is required',
          variant: 'destructive',
        });
        return false;
      }
      
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `User has been deleted successfully.`,
      });
      
      // Call the success callback to refresh the list
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error deleting user',
        description: error.message || 'There was an error deleting the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    deleteUser
  };
}
