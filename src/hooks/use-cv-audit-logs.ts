import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CvAuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by: string | null;
  changed_by_name: string | null;
  old_data: any;
  new_data: any;
  changed_fields: string[] | null;
  changed_at: string;
}

export const useCvAuditLogs = (profileId: string, enabled: boolean = true) => {
  const { toast } = useToast();

  const {
    data: auditLogs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cv-audit-logs', profileId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_cv_audit_history', {
          target_profile_id: profileId,
          limit_records: 100
        });

        if (error) {
          console.error('Error fetching audit logs:', error);
          toast({
            title: 'Error Loading Audit Logs',
            description: 'Failed to load audit history for this profile',
            variant: 'destructive',
          });
          throw error;
        }

        return data as CvAuditLog[];
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: 'Error Loading Audit Logs',
          description: 'Failed to load audit history for this profile',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: enabled && !!profileId
  });

  return {
    auditLogs: auditLogs || [],
    isLoading,
    error,
    refetch
  };
};

// Helper function to format field names for display
export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to format table names for display
export const formatTableName = (tableName: string): string => {
  const tableNameMap: Record<string, string> = {
    'general_information': 'General Information',
    'technical_skills': 'Technical Skills',
    'specialized_skills': 'Specialized Skills',
    'experiences': 'Work Experience',
    'education': 'Education',
    'trainings': 'Training & Certifications',
    'achievements': 'Achievements',
    'projects': 'Projects'
  };
  
  return tableNameMap[tableName] || formatFieldName(tableName);
};

// Helper function to get operation color
export const getOperationColor = (operation: string) => {
  switch (operation) {
    case 'INSERT':
      return 'text-green-600 dark:text-green-400';
    case 'UPDATE':
      return 'text-blue-600 dark:text-blue-400';
    case 'DELETE':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

// Helper function to get operation label
export const getOperationLabel = (operation: string) => {
  switch (operation) {
    case 'INSERT':
      return 'Added';
    case 'UPDATE':
      return 'Updated';
    case 'DELETE':
      return 'Deleted';
    default:
      return operation;
  }
};