import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BenchRecord } from '@/components/bench/types/benchRecord';


interface BenchData {
  bench_records: BenchRecord[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export function useBenchData() {
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
  const rpcParams = useMemo(() => ({
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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bench-data', rpcParams],
    queryFn: async () => {
      console.log('Bench Data Query:', rpcParams);

      const { data: rpcData, error } = await supabase.rpc('list_bench', rpcParams);

      if (error) {
        console.error('Bench data RPC call error:', error);
        throw error;
      }

      if (rpcData && typeof rpcData === 'object') {
        return {
          bench_records: (rpcData as any).bench_records || [],
          pagination: (rpcData as any).pagination || {
            total_count: 0,
            filtered_count: 0,
            page: currentPage,
            per_page: perPage,
            page_count: 0
          }
        } as BenchData;
      }

      return {
        bench_records: [],
        pagination: {
          total_count: 0,
          filtered_count: 0,
          page: currentPage,
          per_page: perPage,
          page_count: 0
        }
      } as BenchData;
    },
  });

  // Sync bench mutation
  const syncBenchMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('sync_bench_now');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bench-data'] });
      toast({
        title: 'Success',
        description: 'Bench data synchronized successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Sync bench error:', error);
      toast({
        title: 'Error',
        description: 'Failed to synchronize bench data.',
        variant: 'destructive',
      });
    },
  });

  // Reset page when filters change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  return {
    // Data
    benchRecords: data?.bench_records || [],
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
    syncBench: syncBenchMutation.mutate,
    isSyncing: syncBenchMutation.isPending,
  };
}