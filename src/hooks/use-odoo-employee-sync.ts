
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

      if (data.success) {
        const { stats } = data;
        let description = `Successfully processed ${stats.total_processed} employees.\n`;
        description += `✅ Updated: ${stats.updated}\n`;
        
        if (stats.not_found > 0) {
          description += `⚠️ Not found in database: ${stats.not_found}\n`;
        }
        
        if (stats.errors > 0) {
          description += `❌ Errors: ${stats.errors}`;
        }

        toast({
          title: 'Sync Completed',
          description,
        });

        // Show additional info about not found employees if any
        if (data.not_found_employees?.length > 0) {
          setTimeout(() => {
            const notFoundCount = data.not_found_employees.length;
            const exampleEmployees = data.not_found_employees
              .slice(0, 3)
              .map(emp => emp.employeeId)
              .join(', ');
            
            toast({
              title: `${notFoundCount} employees not found in database`,
              description: `Examples: ${exampleEmployees}${notFoundCount > 3 ? '...' : ''}. Check sync results for full list.`,
              variant: 'destructive',
            });
          }, 2000);
        }
      } else {
        throw new Error(data.error || 'Sync failed');
      }

      return data;
    } catch (error: any) {
      console.error('Error syncing employees:', error);
      
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync employees from Odoo',
        variant: 'destructive'
      });
      
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
