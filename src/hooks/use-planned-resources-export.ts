
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export function usePlannedResourcesExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportPlannedResources = async () => {
    try {
      setIsExporting(true);
      
      console.log('Starting planned resources export...');
      
      // Use a high limit to ensure we get all rows (Supabase default is 1000)
      const { data, error } = await supabase
        .rpc('export_planned_resources')
        .limit(10000); // Set explicit high limit
      
      if (error) {
        console.error('Export RPC error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No planned resources found to export.",
          variant: "default"
        });
        return;
      }
      
      console.log(`Retrieved ${data.length} planned resources from RPC`);
      
      // Check if we might be hitting the limit
      if (data.length === 10000) {
        console.warn('Retrieved exactly 10000 rows - might be hitting the limit!');
        toast({
          title: "Warning",
          description: `Retrieved ${data.length} rows. If you expect more, the export might be incomplete.`,
          variant: "default"
        });
      }
      
      // Convert the data to CSV format
      const csvData = data.map(resource => ({
        'Employee ID': resource.employee_id,
        'Employee Name': resource.employee_name,
        'SBU': resource.sbu_name,
        'Project Name': resource.project_name,
        'Client Name': resource.client_name,
        'Project Manager': resource.project_manager,
        'Bill Type': resource.bill_type_name,
        'Engagement %': resource.engagement_percentage,
        'Billing %': resource.billing_percentage,
        'Start Date': resource.engagement_start_date,
        'Release Date': resource.release_date,
        'Weekly Validation': resource.weekly_validation ? 'Yes' : 'No',
        'Created At': new Date(resource.created_at).toLocaleDateString()
      }));
      
      console.log(`Converting ${csvData.length} records to CSV`);
      
      // Generate CSV using papaparse
      const csv = Papa.unparse(csvData);
      
      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `planned_resources_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `Successfully exported ${data.length} planned resources to CSV.`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export planned resources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportPlannedResources,
    isExporting
  };
}
