
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncStats {
  total_processed: number;
  updated: number;
  not_found: number;
  errors: number;
  total_fetched?: number;
  valid_employees?: number;
}

interface NotFoundEmployee {
  employeeId: string;
  name: string;
  email: string;
  sbuName: string;
}

interface ErrorEmployee {
  employeeId: string;
  reason: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: SyncStats;
  not_found_employees: NotFoundEmployee[];
  error_employees: ErrorEmployee[];
}

export function useOdooEmployeeSync() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncEmployees = async () => {
    try {
      setIsSyncing(true);
      console.log('Starting Odoo employee sync...');

      toast({
        title: 'Sync Started',
        description: 'Fetching employee data from Odoo...',
      });

      const { data, error } = await supabase.functions.invoke('sync-odoo-employees');

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('Sync completed:', data);
      setLastSyncResult(data);

      return data;
    } catch (error: unknown) {
      console.error('Error syncing employees:', error);
      
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncEmployees,
    isSyncing,
    lastSyncResult
  };
}
