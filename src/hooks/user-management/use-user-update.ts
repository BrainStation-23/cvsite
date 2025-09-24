
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

export function useUserUpdate(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const { setIsLoading } = state;
  
  // Update user
  const updateUser = async (userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    customRoleId?: string | null;
    sbuContext?: string | null;
    employeeId: string;
    sbuId?: string | null;
    expertiseId?: string | null;
    resourceTypeId?: string | null;
    dateOfJoining?: string | null;
    careerStartDate?: string | null;
    managerId?: string | null;
    dateOfBirth?: string | null;
    resignationDate?: string | null;
    exitDate?: string | null;
    active?: boolean;
    hasOverhead?: boolean;
    password?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          customRoleId: userData.customRoleId,
          sbuContext: userData.sbuContext,
          employeeId: userData.employeeId,
          sbuId: userData.sbuId,
          expertiseId: userData.expertiseId,
          resourceTypeId: userData.resourceTypeId,
          dateOfJoining: userData.dateOfJoining,
          careerStartDate: userData.careerStartDate,
          managerId: userData.managerId,
          dateOfBirth: userData.dateOfBirth,
          resignationDate: userData.resignationDate,
          exitDate: userData.exitDate,
          active: userData.active,
          hasOverhead: userData.hasOverhead,
          password: userData.password || undefined
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "User updated",
        description: `${userData.firstName} ${userData.lastName} (${userData.employeeId}) has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        description: error.message || 'There was an error updating the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset user password
  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      if (!userId) return false;
      
      const { error } = await supabase.functions.invoke('update-user', {
        body: {
          userId,
          password: newPassword
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset",
        description: `Password has been reset successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error resetting password',
        description: error.message || 'There was an error resetting the password',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    updateUser,
    resetPassword
  };
}
