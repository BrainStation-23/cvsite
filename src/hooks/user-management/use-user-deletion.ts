
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserDeletion(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const { setIsDeleting } = state;
  
  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      
      if (!userId) return false;
      
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: `User has been deleted successfully.`,
      });
      
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
