
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface ExportResource {
  id?: string; // resource_planning.id
  profile_id?: string;
  project_id?: string;
  profile?: {
    employee_id?: string;
    first_name?: string;
    last_name?: string;
    has_overhead?: boolean;
  };
  sbu?: {
    name?: string;
  };
  project?: {
    project_name?: string;
    client_name?: string;
  };
  manager: {
    first_name?: string;
  };
  bill_type?: {
    name?: string;
  };
  bill_type_id?: string;
  engagement_percentage?: number;
  billing_percentage?: number;
  engagement_start_date?: string;
  release_date?: string;
  weekly_validation?: boolean;
  created_at?: string;
}

export function usePlannedResourcesExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { toast } = useToast();

  // Accept selectedItems as an optional parameter
  const exportPlannedResources = async (selectedItems?: ExportResource[]): Promise<void> => {
    try {
      setIsExporting(true);

      // If selectedItems are provided, export only those
      if (selectedItems && selectedItems.length > 0) {
        console.log('Selected items for export:', selectedItems);
        const csvData = selectedItems.map(resource => ({
          // IDs for bulk update (hidden columns)
          'Resource Planning ID': resource.id || '',
          'Profile ID': resource.profile_id || '',
          'Project ID': resource.project_id || '',
          'Bill Type ID': resource.bill_type_id || '',
          // Human readable data
          'Employee ID': resource.profile?.employee_id || '',
          'Employee Name': `${resource.profile?.first_name || ''} ${resource.profile?.last_name || ''}`.trim() || '',
          'Overhead': resource.profile?.has_overhead ? 'Yes' : 'No',
          'SBU': resource.sbu?.name || '',
          'Project Name': resource.project?.project_name || '',
          'Client Name': resource.project?.client_name || '',
          'Manager': resource.manager.first_name || '',
          'Bill Type': resource.bill_type?.name || '',
          'Engagement %': resource.engagement_percentage || 0,
          'Billing %': resource.billing_percentage || 0,
          'Start Date': resource.engagement_start_date ? resource.engagement_start_date.split('T')[0] : '',
          'Release Date': resource.release_date ? resource.release_date.split('T')[0] : '',
          'Weekly Validation': resource.weekly_validation ? 'Yes' : 'No',
          'Created At': resource.created_at ? resource.created_at.split('T')[0] : ''
        }));

        const csv = Papa.unparse(csvData);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `planned_resources_selected_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast({
            title: "Export Successful",
            description: `Successfully exported ${selectedItems.length} selected planned resources to CSV.`,
            variant: "default"
          });
        }
        return;
      }

      console.log('Starting planned resources export using pagination...');
      
      let allResources: any[] = [];
      let currentPage = 1;
      const itemsPerPage = 1000; // Use a large page size for efficiency
      let hasMorePages = true;
      
      // Iterate through all pages to get all data
      while (hasMorePages) {
        console.log(`Fetching page ${currentPage}...`);
        
        const { data: rpcData, error } = await supabase.rpc('get_planned_resource_data', {
          search_query: null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: 'created_at',
          sort_order: 'desc',
          sbu_filter: null,
          manager_filter: null,
          bill_type_filter: null,
          project_search: null,
          min_engagement_percentage: null,
          max_engagement_percentage: null,
          min_billing_percentage: null,
          max_billing_percentage: null,
          start_date_from: null,
          start_date_to: null,
          end_date_from: null,
          end_date_to: null,
        });
        
        if (error) {
          console.error('Export RPC error:', error);
          throw error;
        }
        
        if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
          const pageResources = (rpcData as any).resource_planning || [];
          const pagination = (rpcData as any).pagination;
          
          console.log(`Page ${currentPage}: Retrieved ${pageResources.length} resources`);
          allResources = [...allResources, ...pageResources];
          
          // Check if we have more pages
          if (pagination && currentPage < pagination.page_count) {
            currentPage++;
          } else {
            hasMorePages = false;
          }
        } else {
          console.warn('Unexpected RPC response structure:', rpcData);
          hasMorePages = false;
        }
      }
      
      if (allResources.length === 0) {
        toast({
          title: "No Data",
          description: "No planned resources found to export.",
          variant: "default"
        });
        return;
      }
      
      console.log(`Total retrieved: ${allResources.length} planned resources across ${currentPage} pages`);
      
      // Convert the data to CSV format - mapping nested response structure correctly
      const csvData = allResources.map(resource => {
        return {
          // IDs for bulk update (hidden columns)
          'Resource Planning ID': resource.id || '',
          'Profile ID': resource.profile_id || '',
          'Project ID': resource.project_id || '',
          'Bill Type ID': resource.bill_type_id || '',
          // Human readable data
          'Employee ID': resource.profile?.employee_id || '',
          'Employee Name': `${resource.profile?.first_name || ''} ${resource.profile?.last_name || ''}`.trim() || '',
          'Overhead': resource.profile?.has_overhead ? 'Yes' : 'No',
          'SBU': resource.sbu?.name || '',
          'Project Name': resource.project?.project_name || '',
          'Client Name': resource.project?.client_name || '',
          'Manager': resource.manager.first_name || '',
          'Bill Type': resource.bill_type?.name || '',
          'Engagement %': resource.engagement_percentage || 0,
          'Billing %': resource.billing_percentage || 0,
          'Start Date': resource.engagement_start_date ? resource.engagement_start_date.split('T')[0] : '',
          'Release Date': resource.release_date ? resource.release_date.split('T')[0] : '',
          'Weekly Validation': resource.weekly_validation ? 'Yes' : 'No',
          'Created At': resource.created_at ? resource.created_at.split('T')[0] : ''
        };
      });
      
      console.log(`Converting ${csvData.length} records to CSV`);
      console.log('Sample CSV data:', csvData[0]); // Debug: Log first CSV record
      
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
          description: `Successfully exported ${allResources.length} planned resources to CSV.`,
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
