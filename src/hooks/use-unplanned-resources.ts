
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UnplannedResource {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  sbu_name: string;
  manager_name: string;
}

interface PaginationData {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface UnplannedResourcesResponse {
  unplanned_resources: UnplannedResource[];
  pagination: PaginationData;
}

interface UseUnplannedResourcesOptions {
  searchQuery?: string;
  selectedSbu?: string | null;
  selectedManager?: string | null;
}

export function useUnplannedResources(options: UseUnplannedResourcesOptions = {}) {
  const { toast } = useToast();
  const { searchQuery = '', selectedSbu = null, selectedManager = null } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: unplannedData, isLoading, error } = useQuery({
    queryKey: ['resource-planning-unplanned', searchQuery, selectedSbu, selectedManager, currentPage],
    queryFn: async () => {
      console.log('Unplanned Resource Planning Query:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        currentPage
      });

      const { data: rpcData, error } = await supabase.rpc('get_unplanned_resources', {
        search_query: searchQuery || null,
        sbu_filter: selectedSbu,
        manager_filter: selectedManager,
        page_number: currentPage,
        items_per_page: itemsPerPage
      });

      if (error) {
        console.error('Unplanned RPC call error:', error);
        throw error;
      }
      
      console.log('Unplanned RPC response:', rpcData);
      
      if (rpcData && typeof rpcData === 'object' && 'unplanned_resources' in rpcData && 'pagination' in rpcData) {
        return {
          unplanned_resources: (rpcData as any).unplanned_resources || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: itemsPerPage,
            page_count: 0
          }
        };
      } else {
        console.warn('Unexpected RPC response structure:', rpcData);
        return {
          unplanned_resources: [],
          pagination: {
            total_count: 0,
            filtered_count: 0,
            page: 1,
            per_page: itemsPerPage,
            page_count: 0
          }
        };
      }
    }
  });

  // Handle errors by showing toast when error occurs
  if (error) {
    console.error('Query error:', error);
    toast({
      title: 'Error Loading Unplanned Resources',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  }

  return {
    unplannedResources: unplannedData?.unplanned_resources || [],
    pagination: unplannedData?.pagination,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
  };
}
