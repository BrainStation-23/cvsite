
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DesignationItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useDesignations = () => {
  return useQuery({
    queryKey: ['designations'],
    queryFn: async (): Promise<DesignationItem[]> => {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};
