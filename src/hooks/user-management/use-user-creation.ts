import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

export function useUserCreation(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const { setIsLoading } = state;
  
  // Add user
  const addUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
    employeeId: string;
    sbuId?: string | null;
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          employeeId: userData.employeeId,
          sbuId: userData.sbuId
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "User created",
        description: `${userData.firstName} ${userData.lastName} (${userData.employeeId}) has been added successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error creating user',
        description: error.message || 'There was an error creating the user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bulk upload (create) - unchanged for create mode
  const bulkUpload = async (uploadFile: File) => {
    try {
      console.log('Starting bulk upload for file:', uploadFile.name);
      state.setIsBulkUploading(true);
      
      if (!uploadFile) {
        toast({
          title: 'No file selected',
          description: 'Please select a file to upload',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Processing bulk upload',
        description: 'Analyzing file and preparing to create users in batches...',
      });
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      console.log('FormData created, invoking function...');
      
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: formData
      });
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Function error:', error);
        throw error;
      }
      
      if (data?.results) {
        const { successful, failed, passwordsGenerated } = data.results;
        const batchInfo = data.batchInfo;
        
        let description = `Successfully processed ${batchInfo?.totalUsers || 'unknown'} users in ${batchInfo?.totalBatches || 'multiple'} batches.\n`;
        description += `✅ ${successful.length} users created successfully`;
        
        if (failed.length > 0) {
          description += `\n❌ ${failed.length} users failed to create`;
        }
        
        if (passwordsGenerated > 0) {
          description += `\n🔑 ${passwordsGenerated} passwords were auto-generated`;
        }
        
        toast({
          title: "Bulk upload completed",
          description,
        });
        
        if (failed.length > 0 && failed.length < 10) {
          const failedEmails = failed.slice(0, 5).map(f => f.email || 'Unknown').join(', ');
          const moreFailures = failed.length > 5 ? ` and ${failed.length - 5} more` : '';
          
          setTimeout(() => {
            toast({
              title: "Some users failed to create",
              description: `Failed: ${failedEmails}${moreFailures}. Check logs for details.`,
              variant: 'destructive',
            });
          }, 2000);
        }
      } else {
        toast({
          title: "Bulk upload completed",
          description: data?.message || `Users have been processed successfully.`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast({
        title: 'Error in bulk upload',
        description: error.message || 'There was an error processing the bulk upload',
        variant: 'destructive',
      });
      return false;
    } finally {
      state.setIsBulkUploading(false);
    }
  };

  // Bulk update - simplified since we're using the new chunked approach
  const bulkUpdate = async (uploadFile: File) => {
    // This is now just a placeholder that triggers the chunked update
    // The actual processing is handled by the BulkUploadDialog component
    return true;
  };
  
  return {
    addUser,
    bulkUpload,
    bulkUpdate
  };
}
