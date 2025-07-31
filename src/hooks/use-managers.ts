
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useManagers() {
  const { data: managers = [], isLoading, error } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          employee_id,
          general_information!inner(
            first_name,
            last_name
          )
        `)
        .not('general_information', 'is', null);
      
      if (error) throw error;
      
      return (data || []).map(profile => ({
        id: profile.id,
        full_name: `${profile.general_information?.first_name || profile.first_name} ${profile.general_information?.last_name || profile.last_name}`,
        employee_id: profile.employee_id,
      }));
    },
  });

  return {
    managers,
    isLoading,
    error,
  };
}
