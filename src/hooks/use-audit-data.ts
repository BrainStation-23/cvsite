
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ForcedImageUpload {
  id: string;
  profile_id: string;
  uploaded_by_user_id: string;
  validation_errors: string[];
  image_url?: string;
  upload_timestamp: string;
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    employee_id?: string;
  };
  general_information?: {
    first_name?: string;
    last_name?: string;
  };
  uploaded_by?: {
    first_name?: string;
    last_name?: string;
    employee_id?: string;
  };
  uploaded_by_general_info?: {
    first_name?: string;
    last_name?: string;
  };
}

interface AuditFilters {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const useAuditData = (filters: AuditFilters = {}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-forced-uploads', filters],
    queryFn: async () => {
      const { page = 1, pageSize = 10, searchTerm, startDate, endDate } = filters;
      
      let query = supabase
        .from('forced_image_uploads')
        .select(`
          *,
          profile:profiles!forced_image_uploads_profile_id_fkey (
            first_name,
            last_name,
            employee_id
          ),
          general_information:profiles!forced_image_uploads_profile_id_fkey (
            general_information (
              first_name,
              last_name
            )
          ),
          uploaded_by:profiles!forced_image_uploads_uploaded_by_user_id_fkey (
            first_name,
            last_name,
            employee_id
          ),
          uploaded_by_general_info:profiles!forced_image_uploads_uploaded_by_user_id_fkey (
            general_information (
              first_name,
              last_name
            )
          )
        `)
        .order('upload_timestamp', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`
          profile.first_name.ilike.%${searchTerm}%,
          profile.last_name.ilike.%${searchTerm}%,
          profile.employee_id.ilike.%${searchTerm}%
        `);
      }

      if (startDate) {
        query = query.gte('upload_timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('upload_timestamp', endDate);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as ForcedImageUpload[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });

  const exportData = async () => {
    try {
      setIsExporting(true);
      
      const { data: exportData, error } = await supabase
        .from('forced_image_uploads')
        .select(`
          *,
          profile:profiles!forced_image_uploads_profile_id_fkey (
            first_name,
            last_name,
            employee_id
          ),
          uploaded_by:profiles!forced_image_uploads_uploaded_by_user_id_fkey (
            first_name,
            last_name,
            employee_id
          )
        `)
        .order('upload_timestamp', { ascending: false });

      if (error) throw error;

      // Convert to CSV format
      const csvContent = convertToCSV(exportData as ForcedImageUpload[]);
      downloadCSV(csvContent, `audit-forced-uploads-${new Date().toISOString().split('T')[0]}.csv`);

      toast({
        title: 'Export Successful',
        description: 'Audit data has been exported to CSV file',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    data: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
    exportData,
    isExporting
  };
};

const convertToCSV = (data: ForcedImageUpload[]): string => {
  const headers = [
    'Upload Date',
    'Profile Name',
    'Employee ID',
    'Uploaded By',
    'Uploader Employee ID',
    'Validation Errors',
    'Image URL'
  ];

  const rows = data.map(item => [
    new Date(item.upload_timestamp).toLocaleString(),
    `${item.profile?.first_name || ''} ${item.profile?.last_name || ''}`.trim(),
    item.profile?.employee_id || '',
    `${item.uploaded_by?.first_name || ''} ${item.uploaded_by?.last_name || ''}`.trim(),
    item.uploaded_by?.employee_id || '',
    item.validation_errors.join('; '),
    item.image_url || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
