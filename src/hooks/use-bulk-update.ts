
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/error-utils';


type ParsedCsv = { users?: unknown[] };
type BulkProcessResult = {
  successCount?: number;
  errorCount?: number;
  results?: { successful?: unknown[]; failed?: Array<{ userId?: string; error?: string }>; };
};

export function useBulkUpdate() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const parseCSVFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('bulk-update-users', {
        body: formData
      });

      if (error) throw error;

      return data as ParsedCsv;
    } catch (error: unknown) {
      console.error('Error parsing CSV:', error);
      throw error;
    }
  };

  const processBulkUsers = async (users: unknown[]) => {
    const { data, error } = await supabase.functions.invoke('bulk-update-users', {
      body: { users }
    });

    if (error) {
      console.error('Error processing bulk update:', error);
      throw error;
    }

    return data as BulkProcessResult;
  };

  const bulkUpdateUsers = async (file: File) => {
    try {
      setIsProcessing(true);

      // Step 1: Parse CSV file
      const parseResult = await parseCSVFile(file);
      
      if (!parseResult?.users || parseResult.users.length === 0) {
        toast({
          title: "No valid users found",
          description: "No valid users found in the CSV file",
          variant: "destructive"
        });
        return { success: false, error: "No valid users found" };
      }

      const users = parseResult.users as unknown[];
      console.log(`Total users to process: ${users.length}`);

      toast({
        title: 'Processing users',
        description: `Processing ${users.length} users in bulk operation...`,
      });

      // Step 2: Process all users in a single bulk operation
      try {
        console.log(`Processing ${users.length} users in bulk operation`);
        
        const bulkResult = await processBulkUsers(users);
        
        const successCount = bulkResult.successCount || 0;
        const errorCount = bulkResult.errorCount || 0;

        // Show results
        if (successCount > 0) {
          toast({
            title: 'Bulk update completed',
            description: `${successCount} users updated successfully` + 
              (errorCount > 0 ? `, ${errorCount} failed` : ''),
            variant: errorCount > 0 ? 'destructive' : 'default'
          });
        } else {
          toast({
            title: 'Bulk update failed',
            description: `${errorCount} users failed to update.`,
            variant: 'destructive'
          });
        }

        return {
          success: true,
          results: bulkResult.results || { successful: [], failed: [] },
          summary: {
            totalUsers: users.length,
            successfulUsers: successCount,
            failedUsers: errorCount,
          }
        };

      } catch (error: unknown) {
        console.error('Error processing bulk update:', error);
        const message = getErrorMessage(error) || 'Bulk processing failed';
        toast({
          title: 'Bulk update failed',
          description: message,
          variant: 'destructive'
        });
        return {
          success: false,
          error: message,
          results: { successful: [], failed: [] }
        };
      }

    } catch (error: unknown) {
      console.error('Error in bulk update process:', error);
      const message = getErrorMessage(error) || 'Bulk update failed';
      toast({
        title: 'Bulk update failed',
        description: message,
        variant: 'destructive'
      });
      return { 
        success: false, 
        error: message 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    bulkUpdateUsers,
    isProcessing,
  };
}
