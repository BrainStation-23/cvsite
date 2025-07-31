
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'unplanned-resources', 
      searchQuery, 
      selectedSbu, 
      selectedManager
    ],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', {
        searchQuery,
        selectedSbu,
        selectedManager
      });

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 100,
        sort_by: 'first_name',
        sort_order: 'asc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

      console.log('Unplanned Resources RPC response:', rpcData);
      
      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        return {
          unplanned_resources: (rpcData as any).resource_planning || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: 100,
            page_count: 0
          }
        };
      }
      
      return {
        unplanned_resources: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: 1,
          per_page: 100,
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
        page: 1,
        per_page: 100,
        page_count: 0
      }
    },
    isLoading,
    error,
    refetch
  };
}
