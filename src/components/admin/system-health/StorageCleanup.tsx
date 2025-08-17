
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, HardDrive, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface CleanupResult {
  success: boolean;
  summary: {
    totalFilesInStorage: number;
    totalReferencedImages: number;
    uniqueReferencedPaths: number;
    orphanedFilesFound: number;
    filesDeleted: number;
    filesRemaining: number;
    errors: number;
  };
  deletedFiles: string[];
  referencedFiles: string[];
  errors: Array<{ file: string; error: string }>;
}

const StorageCleanup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-storage');
      
      if (error) {
        throw error;
      }

      setLastResult(data);
      
      if (data.success) {
        const { summary } = data;
        toast({
          title: "Storage cleanup completed",
          description: `Found ${summary.orphanedFilesFound} orphaned files, deleted ${summary.filesDeleted}. ${summary.filesRemaining} files remaining.`,
        });
      } else {
        toast({
          title: "Storage cleanup failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Storage cleanup error:', error);
      toast({
        title: "Error",
        description: `Failed to cleanup storage: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Health Check
          </CardTitle>
          <CardDescription>
            Clean up orphaned profile images that are no longer referenced in the database.
            This helps keep your storage bucket organized and reduces storage costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCleanup}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isLoading ? 'Cleaning...' : 'Clean Up Storage'}
            </Button>
            
            {lastResult && (
              <Badge variant={lastResult.success ? "default" : "destructive"}>
                {lastResult.success ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                Last run: {lastResult.success ? 'Success' : 'Failed'}
              </Badge>
            )}
          </div>

          {lastResult && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3">Last Cleanup Results</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {lastResult.summary.totalFilesInStorage}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Files Found
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {lastResult.summary.uniqueReferencedPaths}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Referenced Files
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {lastResult.summary.orphanedFilesFound}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Orphaned Files
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {lastResult.summary.filesDeleted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Files Deleted
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {lastResult.summary.filesRemaining}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Files Remaining
                  </div>
                </div>
                
                {lastResult.summary.errors > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {lastResult.summary.errors}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Errors
                    </div>
                  </div>
                )}
              </div>

              {lastResult.errors.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Errors ({lastResult.errors.length})
                  </h5>
                  <div className="space-y-1">
                    {lastResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {error.file}: {error.error}
                      </div>
                    ))}
                    {lastResult.errors.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... and {lastResult.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lastResult.deletedFiles.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    View Deleted Files ({lastResult.deletedFiles.length})
                  </summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {lastResult.deletedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {file}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {lastResult.referencedFiles && lastResult.referencedFiles.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    Sample Referenced Files ({lastResult.referencedFiles.length} shown)
                  </summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {lastResult.referencedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {file}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageCleanup;
