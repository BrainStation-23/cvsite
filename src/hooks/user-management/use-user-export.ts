
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserExport(state: ReturnType<typeof import('./use-user-state').useUserState>) {
  const { toast } = useToast();
  const { setIsLoading } = state;
  
  const exportUsers = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting user export...');
      
      const { data, error } = await supabase.functions.invoke('export-users', {
        method: 'GET'
      });
      
      if (error) {
        console.error('Export error:', error);
        throw error;
      }
      
      // The data should be the CSV content as a string
      if (typeof data === 'string') {
        // Create a blob and download it
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Export successful',
          description: 'Users have been exported to CSV file',
        });
        
        console.log('User export completed successfully');
        return true;
      } else {
        throw new Error('Invalid response format from export function');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: 'Export failed',
        description: error.message || 'There was an error exporting users',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportUsers
  };
}
