
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseUnplannedResourcesProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
}

export function useUnplannedResources({
  searchQuery,
  selectedSbu,
  selectedManager,
}: UseUnplannedResourcesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // RPC params and response types
  interface UnplannedResourcesRpcParams {
    search_query: string | null;
    page_number: number;
    items_per_page: number;
    sbu_filter: string | null;
    manager_filter: string | null;
  }

  interface UnplannedSBU {
    id: string;
    name: string;
    sbu_head_email: string | null;
  }

  interface UnplannedManager {
    id: string;
    employee_id: string | null;
    first_name: string | null;
    last_name: string | null;
  }

  interface UnplannedExpertiseType {
    id: string;
    name: string;
  }

  interface UnplannedResourceType {
    id: string;
    name: string;
  }

  interface UnplannedResourceItem {
    id: string;
    profile_id: string;
    employee_id: string | null;
    first_name: string | null;
    last_name: string | null;
    current_designation: string | null;
    profile_image: string | null;
    biography: string | null;
    date_of_joining: string | null;
    career_start_date: string | null;
    total_engagement_percentage: number;
    available_capacity: number;
    sbu: UnplannedSBU | null;
    manager: UnplannedManager | null;
    expertise_type: UnplannedExpertiseType | null;
    resource_type: UnplannedResourceType | null;
    created_at: string;
    updated_at: string;
    active_assignments: unknown[];
  }

  interface UnplannedResourcesPagination {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  }

  interface UnplannedResourcesResponse {
    unplanned_resources: UnplannedResourceItem[];
    pagination: UnplannedResourcesPagination;
  }

  // Memoized RPC parameters - now using UUIDs for ID-based filters
  const rpcParams: UnplannedResourcesRpcParams = useMemo(() => ({
    search_query: searchQuery || null,
    page_number: currentPage,
    items_per_page: itemsPerPage,
    sbu_filter: selectedSbu, // Pass UUID directly
    manager_filter: selectedManager, // Pass UUID directly
  }), [searchQuery, currentPage, selectedSbu, selectedManager]);

  // Data fetching
  const { data, isLoading, error, refetch } = useQuery<UnplannedResourcesResponse>({
    queryKey: ['unplanned-resources', rpcParams],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', rpcParams);

      if (error) {
        console.error('Unplanned resources RPC call error:', error);
        throw error;
      }

      if (rpcData && typeof rpcData === 'object' && 'unplanned_resources' in rpcData) {
        const typed = rpcData as unknown as UnplannedResourcesResponse;
        return typed;
      }

      return {
        unplanned_resources: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: rpcParams.page_number,
          per_page: rpcParams.items_per_page,
          page_count: 0
        }
      } as UnplannedResourcesResponse;
    },
  });

  return {
    unplannedResources: data ?? { unplanned_resources: [], pagination: { total_count: 0, filtered_count: 0, page: currentPage, per_page: itemsPerPage, page_count: 0 } },
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    refetch,
  };
}
