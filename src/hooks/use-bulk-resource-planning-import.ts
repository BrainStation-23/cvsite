
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BulkResourcePlanningCSVRow } from '@/utils/bulkResourcePlanningCsvUtils';
import type { Database } from '@/integrations/supabase/types';
import Papa from 'papaparse';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentItem: string;
  isComplete: boolean;
}

interface ImportError {
  row: BulkResourcePlanningCSVRow;
  error: string;
  type: 'profile_not_found' | 'bill_type_not_found' | 'project_not_found' | 'database_error';
}

export const useBulkResourcePlanningImport = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentItem: '',
    isComplete: false
  });
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const downloadErrorsAsCSV = () => {
    if (importErrors.length === 0) {
      toast({
        title: 'No errors to download',
        description: 'All records were imported successfully.',
      });
      return;
    }

    const errorData = importErrors.map(({ row, error, type }) => ({
      employee_id: row.employee_id,
      bill_type: row.bill_type,
      project_name: row.project_name,
      engagement_percentage: row.engagement_percentage,
      billing_percentage: row.billing_percentage,
      start_date: row.start_date,
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
      link.setAttribute('download', `resource_planning_import_errors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Error report downloaded',
      description: `Downloaded ${importErrors.length} failed import records.`
    });
  };

  const processImport = async (validRows: BulkResourcePlanningCSVRow[]) => {
    if (validRows.length === 0) return;

    setIsProcessing(true);
    setImportErrors([]);
    setProgress({
      total: validRows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      currentItem: '',
      isComplete: false
    });

    const errors: ImportError[] = [];
    type ResourcePlanningInsert = Database['public']['Tables']['resource_planning']['Insert'];
    const successfulImports: ResourcePlanningInsert[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      setProgress(prev => ({
        ...prev,
        processed: i + 1,
        currentItem: `${row.employee_id} - ${row.project_name}`
      }));

      try {
        // Find profile by employee_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('employee_id', row.employee_id)
          .single();

        if (profileError || !profile) {
          errors.push({
            row,
            error: `Employee with ID ${row.employee_id} not found in the system.`,
            type: 'profile_not_found'
          });
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }

        // Find bill type by name
        const { data: billType, error: billTypeError } = await supabase
          .from('bill_types')
          .select('id')
          .ilike('name', row.bill_type)
          .single();

        if (billTypeError || !billType) {
          errors.push({
            row,
            error: `Bill type "${row.bill_type}" not found in the system.`,
            type: 'bill_type_not_found'
          });
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }

        // Find project by name
        const { data: project, error: projectError } = await supabase
          .from('projects_management')
          .select('id')
          .ilike('project_name', row.project_name)
          .single();

        if (projectError || !project) {
          errors.push({
            row,
            error: `Project "${row.project_name}" not found in the system.`,
            type: 'project_not_found'
          });
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }

        // Insert the record
        const insertData: ResourcePlanningInsert = {
          profile_id: profile.id,
          bill_type_id: billType.id,
          project_id: project.id,
          engagement_percentage: row.engagement_percentage,
          billing_percentage: row.billing_percentage,
          engagement_start_date: row.start_date,
          release_date: row.release_date,
          engagement_complete: false,
          weekly_validation: false
        };

        const { error: insertError } = await supabase
          .from('resource_planning')
          .insert(insertData);

        if (insertError) {
          errors.push({
            row,
            error: `Database error: ${insertError.message}`,
            type: 'database_error'
          });
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          continue;
        }

        successfulImports.push(insertData);
        setProgress(prev => ({ ...prev, successful: prev.successful + 1 }));

      } catch (error) {
        errors.push({
          row,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'database_error'
        });
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setImportErrors(errors);
    setProgress(prev => ({ ...prev, isComplete: true, currentItem: '' }));
    setIsProcessing(false);

    // Show final results
    if (successfulImports.length > 0) {
      toast({
        title: 'Import completed',
        description: `${successfulImports.length} records imported successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}.`
      });
    }

    if (errors.length > 0) {
      toast({
        title: 'Import completed with errors',
        description: `${errors.length} records failed to import. You can download the error report for details.`,
        variant: 'destructive'
      });
    }

    return {
      successful: successfulImports.length,
      failed: errors.length,
      errors
    };
  };

  return {
    processImport,
    downloadErrorsAsCSV,
    isProcessing,
    progress,
    importErrors
  };
};
