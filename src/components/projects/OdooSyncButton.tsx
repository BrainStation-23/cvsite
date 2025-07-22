
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Download } from 'lucide-react';

interface SyncStats {
  total_fetched: number;
  new_synced: number;
  updated: number;
  skipped: number;
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
        toast({
          title: 'Sync Completed Successfully',
          description: `Fetched ${response.stats.total_fetched} projects. New: ${response.stats.new_synced}, Updated: ${response.stats.updated}, Skipped: ${response.stats.skipped}`,
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
