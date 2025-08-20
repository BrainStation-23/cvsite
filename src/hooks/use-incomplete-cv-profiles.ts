
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IncompleteProfile {
  profile_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  resource_type: string;
  completion_percentage: number;
  missing_sections: string[];
  missing_count: number;
}

export function useIncompleteCvProfiles(resourceTypeFilter?: string) {
  return useQuery({
    queryKey: ['incomplete-cv-profiles', resourceTypeFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_incomplete_cv_profiles', {
        resource_type_filter: resourceTypeFilter || null,
      });

      if (error) {
        console.error('Error fetching incomplete CV profiles:', error);
        throw error;
      }

      return data as unknown as IncompleteProfile[];
    },
  });
}
