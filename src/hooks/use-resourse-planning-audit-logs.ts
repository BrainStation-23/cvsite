import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResourcePlanningAuditLog {
  id: string;
  resource_planning_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by: string | null;
  changed_at: string;
  changed_fields: string[] | null;
  created_at: string;
  old_data_enriched: any;
  new_data_enriched: any;
  changed_by_user: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
  } | null;
}

export interface ResourcePlanningAuditLogsParams {
  bill_type_filter?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  employee_id_filter?: string | null;
  forecasted_project_filter?: string | null;
  items_per_page?: number;
  operation_type_filter?: string | null;
  page_number?: number;
  project_name_filter?: string | null;
  search_query?: string | null;
  sort_by?: string | null;
  sort_order?: 'asc' | 'desc' | null;
}

export const useResourcePlanningAuditLogs = (
  params: ResourcePlanningAuditLogsParams,
  enabled: boolean = true
) => {
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['resource-planning-audit-logs', params],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('search_resource_planning_audit_logs' as any, params);

        if (error) {
          console.error('Error fetching resource planning audit logs:', error);
          toast({
            title: 'Error Loading Audit Logs',
            description: 'Failed to load resource planning audit history',
            variant: 'destructive',
          });
          throw error;
        }

        return data as {
          audit_logs: ResourcePlanningAuditLog[];
          pagination: {
            total_count: number;
            filtered_count: number;
            page: number;
            per_page: number;
            page_count: number;
          };
        };
      } catch (error) {
        console.error('Error fetching resource planning audit logs:', error);
        toast({
          title: 'Error Loading Audit Logs',
          description: 'Failed to load resource planning audit history',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled,
  });

  return {
    auditLogs: data?.audit_logs || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};