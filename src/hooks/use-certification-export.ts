
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export interface ExportCertificationRecord {
  first_name: string;
  last_name: string;
  employee_id: string;
  sbu_name: string;
  sbu_id: string;
  id: string;
  profile_id: string;
  title: string;
  provider: string;
  certification_date: string;
  description: string;
  certificate_url: string;
  is_renewable: boolean;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface CertificationsPagination {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface CertificationsResponse {
  certifications: Array<{
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
    sbu_name: string | null;
    sbu_id: string | null;
    id: string;
    profile_id: string;
    title: string | null;
    provider: string | null;
    certification_date: string | null;
    description: string | null;
    certificate_url: string | null;
    is_renewable: boolean | null;
    expiry_date: string | null;
    created_at: string;
    updated_at: string;
  }>;
  pagination: CertificationsPagination;
}

export function useCertificationExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { toast } = useToast();

  // Accept selectedItems as an optional parameter
  const exportCertifications = async (): Promise<void> => {
    try {
      setIsExporting(true);
      console.log('Starting certification export using pagination...');
      let allCertifications: CertificationsResponse['certifications'] = [];
      let currentPage = 1;
      const itemsPerPage = 1000; // Use a large page size for efficiency
      let hasMorePages = true;
      
      // Iterate through all pages to get all data
      while (hasMorePages) {
        console.log(`Fetching page ${currentPage}...`);
        
        const { data: rpcData, error } = await supabase.rpc('search_certifications', {
          search_query: null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: 'created_at',
          sort_order: 'desc',
          sbu_filter: null,
        });
        
        if (error) {
          console.error('Export RPC error:', error);
          throw error;
        }
        
        if (rpcData && typeof rpcData === 'object' && 'certifications' in rpcData) {
          const typed = rpcData as unknown as CertificationsResponse;
          const pageResources = typed.certifications || [];
          const pagination = typed.pagination;

          console.log(`Page ${currentPage}: Retrieved ${pageResources.length} certifications`);
          allCertifications = [...allCertifications, ...pageResources];

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

      if (allCertifications.length === 0) {
        toast({
          title: "No Data",
          description: "No certifications found to export.",
          variant: "default"
        });
        return;
      }

      console.log(`Total retrieved: ${allCertifications.length} planned resources across ${currentPage} pages`);

      // Convert the data to CSV format - mapping nested response structure correctly
      // Convert the data to CSV format
      const csvData = allCertifications.map(cert => ({
        'Employee ID': cert.employee_id ?? '',
        'Employee Name': `${cert.first_name ?? ''} ${cert.last_name ?? ''}`.trim(),
        'SBU': cert.sbu_name ?? '',
        'Title': cert.title ?? '',
        'Provider': cert.provider ?? '',
        'Certification Date': cert.certification_date ? String(cert.certification_date).split('T')[0] : '',
        'Expiry Date': cert.expiry_date ? String(cert.expiry_date).split('T')[0] : '',
        'Description': cert.description ?? '',
        'Certificate URL': cert.certificate_url ?? '',
        'Is Renewable': cert.is_renewable ? 'Yes' : 'No',
        'Created At': cert.created_at ? String(cert.created_at).split('T')[0] : '',
        'Updated At': cert.updated_at ? String(cert.updated_at).split('T')[0] : '',
      }));
      
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
        link.setAttribute('download', `certifications_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `Successfully exported ${allCertifications.length} Certifications to CSV.`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export certifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportCertifications,
    isExporting
  };
}
