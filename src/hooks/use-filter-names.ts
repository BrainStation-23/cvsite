
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFilterNames(selectedSbu: string | null, selectedManager: string | null) {
  // Get SBU name from ID
  const { data: sbuData } = useQuery({
    queryKey: ['sbu-name', selectedSbu],
    queryFn: async () => {
      if (!selectedSbu) return null;
      
      const { data, error } = await supabase
        .from('sbus')
        .select('name')
        .eq('id', selectedSbu)
        .single();
      
      if (error) {
        console.error('Error fetching SBU:', error);
        return null;
      }
      
      return data?.name || null;
    },
    enabled: !!selectedSbu,
  });

  // Get manager name from ID
  const { data: managerData } = useQuery({
    queryKey: ['manager-name', selectedManager],
    queryFn: async () => {
      if (!selectedManager) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          first_name,
          last_name,
          general_information (
            first_name,
            last_name
          )
        `)
        .eq('id', selectedManager)
        .single();
      
      if (error) {
        console.error('Error fetching manager:', error);
        return null;
      }
      
      const firstName = data?.general_information?.first_name || data?.first_name;
      const lastName = data?.general_information?.last_name || data?.last_name;
      
      return firstName && lastName ? `${firstName} ${lastName}` : null;
    },
    enabled: !!selectedManager,
  });

  return {
    sbuName: sbuData,
    managerName: managerData,
  };
}
