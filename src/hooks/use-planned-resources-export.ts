
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface PlannedResourceExportRow {
  employee_id: string;
  employee_name: string;
  sbu_name: string;
  project_name: string;
  client_name: string;
  project_manager: string;
  bill_type_name: string;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date: string;
  weekly_validation: boolean;
  created_at: string;
}

export const usePlannedResourcesExport = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportPlannedResources = async () => {
    try {
      setIsExporting(true);
      
      // Call the RPC function to get all planned resources
      const { data, error } = await supabase
        .rpc('export_planned_resources');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: 'No data to export',
          description: 'There are no planned resources to export.',
          variant: 'destructive'
        });
        return;
      }

      // Convert the data to CSV format
      const csvData = data.map((row: PlannedResourceExportRow) => ({
        'Employee ID': row.employee_id || '',
        'Employee Name': row.employee_name || '',
        'SBU': row.sbu_name || '',
        'Project Name': row.project_name || '',
        'Client Name': row.client_name || '',
        'Project Manager': row.project_manager || '',
        'Bill Type': row.bill_type_name || '',
        'Engagement %': row.engagement_percentage || 0,
        'Billing %': row.billing_percentage || 0,
        'Start Date': row.engagement_start_date || '',
        'Release Date': row.release_date || '',
        'Weekly Validation': row.weekly_validation ? 'Yes' : 'No',
        'Created At': row.created_at ? new Date(row.created_at).toLocaleDateString() : ''
      }));

      // Generate CSV and download
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `planned_resources_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: 'Export successful',
        description: `Exported ${data.length} planned resources to CSV.`
      });

    } catch (error) {
      console.error('Error exporting planned resources:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export planned resources. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportPlannedResources,
    isExporting
  };
};
