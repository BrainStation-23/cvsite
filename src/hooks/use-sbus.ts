
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSBUs() {
  const { data: sbus = [], isLoading, error } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sbus')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    sbus,
    isLoading,
    error,
  };
}
