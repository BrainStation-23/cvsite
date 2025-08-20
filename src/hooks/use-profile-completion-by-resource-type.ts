
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionByResourceType {
  resource_type_id: string;
  resource_type_name: string;
  total_profiles: number;
  completed_profiles: number;
  incomplete_profiles: number;
  completion_rate: number;
}

export function useProfileCompletionByResourceType() {
  return useQuery({
    queryKey: ['profile-completion-by-resource-type'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_profile_completion_by_resource_type');

      if (error) {
        console.error('Error fetching profile completion by resource type:', error);
        throw error;
      }

      return data as ProfileCompletionByResourceType[];
    },
  });
}
