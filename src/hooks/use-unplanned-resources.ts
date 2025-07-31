
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnplannedResourcesParams {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
}

export function useUnplannedResources(params: UnplannedResourcesParams) {
  const { 
    searchQuery, 
    selectedSbu, 
    selectedManager
  } = params;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'unplanned-resources', 
      searchQuery, 
      selectedSbu, 
      selectedManager,
      currentPage
    ],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        currentPage
      });

      // Use the new dedicated RPC function for unplanned resources
      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('Unplanned resources RPC call error:', error);
        throw error;
      }

      console.log('Unplanned Resources RPC response:', rpcData);
      
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
    }
  });

  return {
    unplannedResources: data || {
      unplanned_resources: [],
      pagination: {
        total_count: 0,
        filtered_count: 0,
        page: currentPage,
        per_page: itemsPerPage,
        page_count: 0
      }
    },
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    refetch
  };
}
