
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCountByResourceType {
  resource_type_id: string;
  resource_type_name: string;
  profile_count: number;
}

export function useProfileCountsByResourceType() {
  return useQuery({
    queryKey: ['profile-counts-by-resource-type'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_profile_counts_by_resource_type');

      if (error) {
        console.error('Error fetching profile counts by resource type:', error);
        throw error;
      }

      return data as ProfileCountByResourceType[];
    },
  });
}
