
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDetails } from '@/types/pip';

export function useEnhancedProfileDetails(profileId: string | null) {
  return useQuery({
    queryKey: ['enhanced-profile-details', profileId],
    queryFn: async (): Promise<ProfileDetails | null> => {
      if (!profileId) return null;

      // Call the RPC function to get comprehensive profile details
      const { data, error } = await supabase.rpc('get_pip_profile_details', {
        target_profile_id: profileId
      });

      if (error) {
        console.error('Error fetching profile details:', error);
        throw error;
      }

      if (!data) return null;

      // Check if the RPC function returned an error
      if (data.error) {
        console.error('RPC function error:', data.error, data.details);
        throw new Error(data.error);
      }

      // The RPC function returns the data in the exact format we need
      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        employee_id: data.employee_id,
        profile_image: data.profile_image,
        sbu_name: data.sbu_name,
        expertise_name: data.expertise_name,
        manager_name: data.manager_name,
        manager_id: data.manager_id,
        current_designation: data.current_designation,
        resource_planning: data.resource_planning || [],
        total_utilization: data.total_utilization || 0
      };
    },
    enabled: !!profileId,
  });
}
