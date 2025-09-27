import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NonBilledRecord, NonBilledResponse, NonBilledRpcParams } from '@/components/NonBilled/types/non-billed-record-data';


interface NonBilledData {
  non_billed_records: NonBilledRecord[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export function useNonBilledData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbus, setSelectedSbus] = useState<string[]>([]);
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
  const [selectedBillTypes, setSelectedBillTypes] = useState<string[]>([]);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('bench_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [perPage, setPerPage] = useState(10);

  // Clear filters function
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSbus([]);
    setSelectedExpertises([]);
    setSelectedBillTypes([]);
    setCurrentPage(1);
  }, []);

  // Memoized RPC parameters
  const rpcParams: NonBilledRpcParams = useMemo(() => ({
    search_query: searchQuery || null,
    page_number: currentPage,
    items_per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    sbu_filter: selectedSbus.length > 0 ? selectedSbus : null,
    expertise_filter: selectedExpertises.length > 0 ? selectedExpertises : null,
    bill_type_filter: selectedBillTypes.length > 0 ? selectedBillTypes : null,
  }), [
    searchQuery,
    currentPage,
    perPage,
    sortBy,
    sortOrder,
    selectedSbus,
    selectedExpertises,
    selectedBillTypes
  ]);

  // Data fetching
  const { data, isLoading, error, refetch } = useQuery<NonBilledData>({
    queryKey: ['non-billed-data', rpcParams],
    queryFn: async () => {
      console.log('Non-Billed Data Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('list_non_billed_resources', rpcParams);

      console.log('Non-Billed Data RPC Response:', rpcData);

      if (error) {
        console.error('Non-Billed data RPC call error:', error);
        throw error;
      }

      if (rpcData && typeof rpcData === 'object') {
        const typed = rpcData as unknown as NonBilledResponse;
        return {
          non_billed_records: typed.non_billed_resources_records || [],
          pagination: typed.pagination || {
            total_count: 0,
            filtered_count: 0,
            page: rpcParams.page_number,
            per_page: rpcParams.items_per_page,
            page_count: 0
          }
        } satisfies NonBilledData;
      }

      return {
        non_billed_records: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: rpcParams.page_number,
          per_page: rpcParams.items_per_page,
          page_count: 0
        }
      } as NonBilledData;
    },
  });

  // Sync bench mutation
  const syncNonBilledMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('sync_non_billed_resources_now');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-billed-data'] });
      toast({
        title: 'Success',
        description: 'Non-billed data synchronized successfully.',
      });
    },
    onError: (error: unknown) => {
      console.error('Sync bench error:', error);
      toast({
        title: 'Error',
        description: 'Failed to synchronize non-billed data.',
        variant: 'destructive',
      });
    },
  });

  // Reset page when filters change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  return {
    // Data
    nonBilledRecords: data?.non_billed_records || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedSbus,
    setSelectedSbus,
    selectedExpertises,
    setSelectedExpertises,
    selectedBillTypes,
    setSelectedBillTypes,
    clearFilters,

    // Pagination and sorting
    currentPage,
    setCurrentPage,
    resetPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    perPage,
    setPerPage,

    // Actions
    syncNonBilled: syncNonBilledMutation.mutate,
    isSyncing: syncNonBilledMutation.isPending,
  };
}