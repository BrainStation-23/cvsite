import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BulkResourcePlanningUpdateCSVRow } from '@/utils/bulkResourcePlanningUpdateCsvUtils';
import Papa from 'papaparse';

interface UpdateProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentItem: string;
  isComplete: boolean;
}

interface UpdateError {
  row: BulkResourcePlanningUpdateCSVRow;
  error: string;
  type: 'profile_not_found' | 'bill_type_not_found' | 'project_not_found' | 'resource_planning_not_found' | 'database_error';
}

export const useBulkResourcePlanningUpdate = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentItem: '',
    isComplete: false
  });
  const [updateErrors, setUpdateErrors] = useState<UpdateError[]>([]);

  const downloadErrorsAsCSV = () => {
    if (updateErrors.length === 0) {
      toast({
        title: 'No errors to download',
        description: 'All records were updated successfully.',
      });
      return;
    }

    const errorData = updateErrors.map(({ row, error, type }) => ({
      resource_planning_id: row.resource_planning_id,
      profile_id: row.profile_id,
      project_id: row.project_id,
      bill_type_id: row.bill_type_id,
      employee_id: row.employee_id,
      engagement_percentage: row.engagement_percentage,
      billing_percentage: row.billing_percentage,
      engagement_start_date: row.engagement_start_date,
      release_date: row.release_date,
      error_type: type,
      error_message: error
    }));

    const csv = Papa.unparse(errorData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `resource_planning_update_errors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Error report downloaded',
      description: `Downloaded ${updateErrors.length} failed update records.`
    });
  };

  const processUpdate = async (validRows: BulkResourcePlanningUpdateCSVRow[]) => {
    if (validRows.length === 0) return;

    setIsProcessing(true);
    setUpdateErrors([]);
    setProgress({
      total: validRows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      currentItem: '',
      isComplete: false
    });

    try {
      // Call the RPC function for bulk update
      const { data, error } = await supabase.rpc('bulk_update_resource_planning', {
        updates_data: validRows as any
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      
      setProgress({
        total: validRows.length,
        processed: validRows.length,
        successful: result.successful_updates || 0,
        failed: result.failed_updates || 0,
        currentItem: '',
        isComplete: true
      });

      // Show final results
      if (result.successful_updates > 0) {
        toast({
          title: 'Update completed',
          description: `${result.successful_updates} records updated successfully${result.failed_updates > 0 ? `, ${result.failed_updates} failed` : ''}.`
        });
      }

      if (result.failed_updates > 0) {
        toast({
          title: 'Update completed with errors',
          description: `${result.failed_updates} records failed to update.`,
          variant: 'destructive'
        });
      }

      return {
        successful: result.successful_updates || 0,
        failed: result.failed_updates || 0,
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setUpdateErrors([{
        row: validRows[0], // Use first row as example
        error: errorMessage,
        type: 'database_error'
      }]);
      
      setProgress(prev => ({ 
        ...prev, 
        failed: validRows.length, 
        isComplete: true, 
        currentItem: '' 
      }));

      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return {
        successful: 0,
        failed: validRows.length,
        errors: [{
          row: validRows[0],
          error: errorMessage,
          type: 'database_error' as const
        }]
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processUpdate,
    downloadErrorsAsCSV,
    isProcessing,
    progress,
    updateErrors
  };
};