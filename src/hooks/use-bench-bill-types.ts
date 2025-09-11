import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BenchBillType {
  id: number;
  bill_type: string | null;
  created_at: string;
  bill_types?: {
    id: string;
    name: string;
    color_code: string;
  };
}

export const useBenchBillTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bench bill types
  const { data: benchBillTypes, isLoading, error } = useQuery({
    queryKey: ['bench-bill-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bench_bill_types')
        .select(`
          id,
          bill_type,
          created_at,
          bill_types!bench_bill_types_bill_type_fkey (
            id,
            name,
            color_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BenchBillType[];
    },
  });

  // Add bench bill type mutation
  const addBenchBillTypeMutation = useMutation({
    mutationFn: async (billTypeId: string) => {
      // Check if it already exists
      const { data: existing } = await supabase
        .from('bench_bill_types')
        .select('id')
        .eq('bill_type', billTypeId)
        .single();

      if (existing) {
        throw new Error('This bill type is already added to bench settings');
      }

      const { data, error } = await supabase
        .from('bench_bill_types')
        .insert({ bill_type: billTypeId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bench-bill-types'] });
      toast({
        title: "Success",
        description: "Bill type added to bench settings",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove bench bill type mutation
  const removeBenchBillTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('bench_bill_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bench-bill-types'] });
      toast({
        title: "Success",
        description: "Bill type removed from bench settings",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    benchBillTypes: benchBillTypes || [],
    isLoading,
    error,
    addBenchBillType: addBenchBillTypeMutation.mutate,
    removeBenchBillType: removeBenchBillTypeMutation.mutate,
    isAddingBenchBillType: addBenchBillTypeMutation.isPending,
    isRemovingBenchBillType: removeBenchBillTypeMutation.isPending,
  };
};