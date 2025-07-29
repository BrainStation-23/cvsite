
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnplannedResourcesParams {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
}

export function useUnplannedResources(params: UnplannedResourcesParams) {
  const { searchQuery, selectedSbu, selectedManager } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unplanned-resources', searchQuery, selectedSbu, selectedManager],
    queryFn: async () => {
      console.log('Unplanned Resources Query:', {
        searchQuery,
        selectedSbu,
        selectedManager
      });

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
        search_query: searchQuery || null,
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }

      console.log('Unplanned Resources RPC response:', rpcData);
      console.log('RPC response type:', typeof rpcData);
      console.log('Is RPC response array?', Array.isArray(rpcData));
      
      return rpcData || [];
    }
  });

  return {
    unplannedResources: data || [],
    isLoading,
    error,
    refetch
  };
}
