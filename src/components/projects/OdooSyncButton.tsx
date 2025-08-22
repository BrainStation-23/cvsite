
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Download } from 'lucide-react';

interface SyncStats {
  total_fetched: number;
  total_processed: number;
  new_synced: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface SyncResponse {
  success: boolean;
  message?: string;
  stats?: SyncStats;
  error?: string;
}

export const OdooSyncButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      
      console.log('Triggering Odoo projects sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-odoo-projects');
      
      if (error) {
        throw error;
      }

      const response: SyncResponse = data;
      
      if (response.success && response.stats) {
        const { stats } = response;
        let description = `Processed ${stats.total_processed || stats.total_fetched} projects.`;
        
        if (stats.new_synced > 0) {
          description += ` New: ${stats.new_synced}`;
        }
        if (stats.updated > 0) {
          description += ` Updated: ${stats.updated}`;
        }
        if (stats.skipped > 0) {
          description += ` Skipped: ${stats.skipped}`;
        }
        if (stats.errors > 0) {
          description += ` Errors: ${stats.errors}`;
        }

        toast({
          title: 'Sync Completed Successfully',
          description,
          variant: stats.errors > 0 ? 'destructive' : 'default'
        });
      } else {
        throw new Error(response.error || 'Sync failed');
      }
      
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync projects from Odoo',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="flex items-center space-x-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{isLoading ? 'Syncing...' : 'Sync from Odoo'}</span>
    </Button>
  );
};
