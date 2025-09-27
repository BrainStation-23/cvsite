import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types that reflect the RPC response structure
interface AuditRawData {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
  project_id: string;
  bill_type_id: string | null;
  release_date: string | null;
  is_forecasted: boolean;
  weekly_validation: boolean;
  billing_percentage: number;
  engagement_complete: boolean;
  engagement_percentage: number;
  engagement_start_date: string;
}

interface AuditProfileRef {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
}

interface AuditProjectRef {
  id: string;
  project_name: string;
  client_name: string | null;
}

interface AuditBillTypeRef {
  id: string;
  name: string;
  is_billable: boolean;
}

export interface AuditEnrichedData {
  raw_data: AuditRawData;
  profile: AuditProfileRef;
  project: AuditProjectRef;
  bill_type: AuditBillTypeRef;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date: string | null;
  engagement_complete: boolean;
  weekly_validation: boolean;
  forecasted_project: unknown | null;
}

// Query params accepted by the RPC
export interface ResourcePlanningAuditLogsParams {
  bill_type_filter?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  employee_id_filter?: string | null;
  items_per_page?: number;
  operation_type_filter?: string | null;
  page_number?: number;
  project_name_filter?: string | null;
  search_query?: string | null;
  sort_by?: string | null;
  sort_order?: 'asc' | 'desc' | null;
}

export interface ResourcePlanningAuditLog {
  id: string;
  resource_planning_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by: string | null;
  changed_at: string;
  changed_fields: string[] | null;
  created_at: string;
  old_data_enriched: AuditEnrichedData | null;
  new_data_enriched: AuditEnrichedData | null;
  changed_by_user: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
  } | null;
}

export interface ResourcePlanningAuditLogsResponse {
  audit_logs: ResourcePlanningAuditLog[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

const isAuditLogsResponse = (val: unknown): val is ResourcePlanningAuditLogsResponse => {
  if (typeof val !== 'object' || val === null) return false;
  const v = val as Record<string, unknown>;
  return Array.isArray(v.audit_logs) && typeof v.pagination === 'object' && v.pagination !== null;
};

export const useResourcePlanningAuditLogs = (
  params: ResourcePlanningAuditLogsParams,
  enabled: boolean = true
) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<ResourcePlanningAuditLogsResponse>({
    queryKey: ['resource-planning-audit-logs', params],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('search_resource_planning_audit_logs', params);

        if (error) {
          console.error('Error fetching resource planning audit logs:', error);
          toast({
            title: 'Error Loading Audit Logs',
            description: 'Failed to load resource planning audit history',
            variant: 'destructive',
          });
          throw error;
        }

        if (isAuditLogsResponse(data)) return data;
        // Fallback empty structure if response is unexpected
        return {
          audit_logs: [],
          pagination: {
            total_count: 0,
            filtered_count: 0,
            page: params.page_number ?? 1,
            per_page: params.items_per_page ?? 10,
            page_count: 0,
          },
        } satisfies ResourcePlanningAuditLogsResponse;
      } catch (error: unknown) {
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