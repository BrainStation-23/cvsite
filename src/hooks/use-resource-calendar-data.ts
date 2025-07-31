
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  format,
  eachWeekOfInterval,
  eachDayOfInterval
} from 'date-fns';

export type CalendarViewType = 'monthly' | 'weekly';

interface CalendarResourceData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  } | null;
  sbu: {
    id: string;
    name: string;
  } | null;
}

export function useResourceCalendarData() {
  const { toast } = useToast();

  const { data: calendarData, isLoading, error, refetch } = useQuery({
    queryKey: ['resource-calendar'],
    queryFn: async () => {
      console.log('Resource Calendar Query - fetching data');

      // Use the planned resources function since calendar typically shows planned resources
      const { data: rpcData, error } = await supabase.rpc('get_planned_resources', {
        search_query: null,
        page_number: 1,
        items_per_page: 1000, // High limit to get all records for calendar view
        sort_by: 'engagement_start_date',
        sort_order: 'asc',
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
        end_date_to: null
      });

      if (error) {
        console.error('Calendar RPC call error:', error);
        throw error;
      }

      console.log('Calendar RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return (rpcData as any).resource_planning || [];
      } else {
        console.warn('Unexpected calendar RPC response structure:', rpcData);
        return [];
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Calendar query error:', error);
        toast({
          title: 'Error Loading Calendar Data',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    }
  });

  return {
    calendarData: calendarData || [],
    isLoading,
    error,
    refetch,
  };
}
