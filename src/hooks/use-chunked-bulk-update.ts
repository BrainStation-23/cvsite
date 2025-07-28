
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

  const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

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

  const processUserChunk = async (users: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-update-users', {
        body: { users }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing chunk:', error);
      throw error;
    }
  };

  const bulkUpdateUsers = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress({
        currentChunk: 0,
        totalChunks: 0,
        processedUsers: 0,
        totalUsers: 0,
        errors: [],
        isComplete: false
      });

      // First, parse the CSV file
      toast({
        title: 'Parsing CSV file',
        description: 'Analyzing the uploaded file...',
      });

      const parseResult = await parseCSVFile(file);
      
      if (!parseResult.users || parseResult.users.length === 0) {
        throw new Error('No valid users found in the CSV file');
      }

      const users = parseResult.users;
      const CHUNK_SIZE = 250; // Process 250 users at a time
      const chunks = chunkArray(users, CHUNK_SIZE);
      
      setProgress(prev => ({
        ...prev,
        totalChunks: chunks.length,
        totalUsers: users.length
      }));

      toast({
        title: 'Starting bulk update',
        description: `Processing ${users.length} users in ${chunks.length} chunks...`,
      });

      const allResults: ChunkResult = {
        successful: [],
        failed: []
      };

      // Process each chunk sequentially
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        setProgress(prev => ({
          ...prev,
          currentChunk: i + 1
        }));

        toast({
          title: `Processing chunk ${i + 1} of ${chunks.length}`,
          description: `Updating ${chunk.length} users...`,
        });

        try {
          const chunkResult = await processUserChunk(chunk);
          
          if (chunkResult.results) {
            allResults.successful.push(...chunkResult.results.successful);
            allResults.failed.push(...chunkResult.results.failed);
          }

          setProgress(prev => ({
            ...prev,
            processedUsers: prev.processedUsers + chunk.length,
            errors: [...prev.errors, ...allResults.failed]
          }));

          // Show progress update
          toast({
            title: `Chunk ${i + 1} completed`,
            description: `${allResults.successful.length} successful, ${allResults.failed.length} failed so far.`,
          });

          // Small delay between chunks to prevent overwhelming the system
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          
          // Add all users in this chunk to failed results
          const chunkErrors = chunk.map((user: any) => ({
            userId: user.userId,
            error: `Chunk processing failed: ${chunkError.message}`
          }));
          
          allResults.failed.push(...chunkErrors);
          
          setProgress(prev => ({
            ...prev,
            processedUsers: prev.processedUsers + chunk.length,
            errors: [...prev.errors, ...chunkErrors]
          }));

          toast({
            title: `Chunk ${i + 1} failed`,
            description: `Error: ${chunkError.message}`,
            variant: 'destructive'
          });
        }
      }

      // Mark as complete
      setProgress(prev => ({
        ...prev,
        isComplete: true
      }));

      // Show final results
      const successCount = allResults.successful.length;
      const failureCount = allResults.failed.length;

      toast({
        title: 'Bulk update completed',
        description: `${successCount} users updated successfully, ${failureCount} failed.`,
        variant: failureCount > 0 ? 'destructive' : 'default'
      });

      // Show detailed error information if there were failures
      if (failureCount > 0 && failureCount <= 10) {
        const errorSample = allResults.failed.slice(0, 5);
        setTimeout(() => {
          toast({
            title: 'Update errors',
            description: `Failed users: ${errorSample.map(e => e.userId).join(', ')}${failureCount > 5 ? ` and ${failureCount - 5} more` : ''}`,
            variant: 'destructive'
          });
        }, 2000);
      }

      return {
        success: true,
        results: allResults,
        summary: {
          totalUsers: users.length,
          successful: successCount,
          failed: failureCount
        }
      };

    } catch (error) {
      console.error('Bulk update error:', error);
      
      setProgress(prev => ({
        ...prev,
        isComplete: true
      }));

      toast({
        title: 'Bulk update failed',
        description: error.message || 'An unexpected error occurred',
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
