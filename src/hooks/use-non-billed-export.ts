import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { NonBilledRecord, NonBilledResponse } from '@/components/NonBilled/types/non-billed-record-data';

export function useNonBilledExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Accept selectedItems as an optional parameter
  const exportNonBilled = async () => {
    try {
      setIsExporting(true);

      // Export all bench data using pagination
      let allRecords: NonBilledRecord[] = [];
      let currentPage = 1;
      const itemsPerPage = 1000;
      let hasMorePages = true;

      while (hasMorePages) {
        const { data: rpcData, error } = await supabase.rpc('list_non_billed_resources', {
          search_query: null,
          page_number: currentPage,
          items_per_page: itemsPerPage,
          sort_by: 'non_billed_resources_date',
          sort_order: 'desc',
          sbu_filter: null,
          expertise_filter: null,
          bill_type_filter: null,
        });

        if (error) {
          console.error('Bench export RPC error:', error);
          throw error;
        }

        const typed = (rpcData as unknown as NonBilledResponse) ?? ({} as NonBilledResponse);
        const { non_billed_resources_records = [], pagination } = typed;

        allRecords = [...allRecords, ...non_billed_resources_records];

        if (pagination && currentPage < pagination.page_count) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      if (allRecords.length === 0) {
        toast({
          title: "No Data",
          description: "No non-billed records found to export.",
          variant: "default"
        });
        return;
      }

      const csvData = allRecords.map((record: NonBilledRecord) => ({
        'Employee ID': record.employee_id ?? '',
        'Employee Name': record.employee_name ?? '',
        'Expertise': record.expertise ?? '',
        'Bill Type': record.bill_type_name ?? '',
        'Non-Billed Date': record.non_billed_resources_date ?? '',
        'SBU': record.sbu_name ?? '',
        'Planned Status': record.planned_status ?? '',
        'Duration (Days)': record.non_billed_resources_duration_days ?? 0,
        'Years of Experience': record.total_years_experience ?? 0,
        'Feedback': record.non_billed_resources_feedback ?? ''
      }));

      const csv = Papa.unparse(csvData);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `non_billed_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Export Successful",
          description: `Successfully exported ${allRecords.length} non-billed records to CSV.`,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Bench export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export non-billed records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportNonBilled,
    isExporting
  };
}