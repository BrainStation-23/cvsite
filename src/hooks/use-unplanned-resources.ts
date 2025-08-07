
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

  // Memoized RPC parameters - now using UUIDs for ID-based filters
  const rpcParams = useMemo(() => ({
    search_query: searchQuery || null,
    page_number: currentPage,
    items_per_page: itemsPerPage,
    sbu_filter: selectedSbu, // Pass UUID directly
    manager_filter: selectedManager, // Pass UUID directly
  }), [searchQuery, currentPage, selectedSbu, selectedManager]);

  // Data fetching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unplanned-resources', rpcParams],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', rpcParams);

      if (error) {
        console.error('Unplanned resources RPC call error:', error);
        throw error;
      }

      if (rpcData && typeof rpcData === 'object' && 'unplanned_resources' in rpcData) {
        return {
          unplanned_resources: (rpcData as any).unplanned_resources || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: currentPage,
            per_page: itemsPerPage,
            page_count: 0
          }
        };
      }

      return {
        unplanned_resources: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: currentPage,
          per_page: itemsPerPage,
          page_count: 0
        }
      };
    },
  });

  return {
    unplannedResources: data || { unplanned_resources: [], pagination: null },
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    refetch,
  };
}
