
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChunkResult {
  successful: any[];
  failed: any[];
}

interface ProgressInfo {
  currentChunk: number;
  totalChunks: number;
  processedUsers: number;
  totalUsers: number;
  errors: any[];
  isComplete: boolean;
}

export function useChunkedBulkUpdate() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo>({
    currentChunk: 0,
    totalChunks: 0,
    processedUsers: 0,
    totalUsers: 0,
    errors: [],
    isComplete: false
  });

  // Remove chunking logic as we now use RPC function for bulk processing

  const parseCSVFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('bulk-update-users', {
        body: formData
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw error;
    }
  };

  const processBulkUsers = async (users: any[]) => {
    const { data, error } = await supabase.functions.invoke('bulk-update-users', {
      body: { users }
    });

    if (error) {
      console.error('Error processing bulk update:', error);
      throw error;
    }

    return data;
  };

  const bulkUpdateUsers = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress({
        currentChunk: 0,
        totalChunks: 1,
        processedUsers: 0,
        totalUsers: 0,
        errors: [],
        isComplete: false
      });

      // Step 1: Parse CSV file
      const parseResult = await parseCSVFile(file);
      
      if (!parseResult.users || parseResult.users.length === 0) {
        toast({
          title: "No valid users found",
          description: "No valid users found in the CSV file",
          variant: "destructive"
        });
        return { success: false, error: "No valid users found" };
      }

      const users = parseResult.users;
      console.log(`Total users to process: ${users.length}`);
      
      setProgress(prev => ({
        ...prev,
        totalUsers: users.length
      }));

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
        
        // Update progress
        setProgress(prev => ({
          ...prev,
          currentChunk: 1,
          processedUsers: users.length,
          errors: bulkResult.results?.failed || [],
          isComplete: true
        }));

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
            totalChunks: 1
          }
        };

      } catch (error: any) {
        console.error('Error processing bulk update:', error);
        
        // Add all users to failed list
        const allFailed = users.map(user => ({
          userId: user.userId,
          error: error.message || 'Bulk processing failed'
        }));
        
        setProgress(prev => ({
          ...prev,
          currentChunk: 1,
          processedUsers: users.length,
          errors: allFailed,
          isComplete: true
        }));

        toast({
          title: 'Bulk update failed',
          description: error.message,
          variant: 'destructive'
        });
        
        return {
          success: false,
          error: error.message,
          results: { successful: [], failed: allFailed }
        };
      }

    } catch (error: any) {
      console.error('Error in bulk update process:', error);
      toast({
        title: 'Bulk update failed',
        description: error.message,
        variant: 'destructive'
      });
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    bulkUpdateUsers,
    isProcessing,
    progress
  };
}
