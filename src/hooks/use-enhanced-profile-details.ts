
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDetails } from '@/types/pip';

// Define the expected RPC response structure
interface RPCProfileResponse {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
  profile_image: string | null;
  sbu_name: string | null;
  expertise_name: string | null;
  manager_name: string | null;
  manager_id: string | null;
  current_designation: string | null;
  resource_planning: any[];
  total_utilization: number;
  error?: string;
  details?: string;
}

export function useEnhancedProfileDetails(profileId: string | null) {
  return useQuery({
    queryKey: ['enhanced-profile-details', profileId],
    queryFn: async (): Promise<ProfileDetails | null> => {
      if (!profileId) return null;

      console.log('Fetching profile details for:', profileId);

      // Call the new RPC function to get profile details for PIP initiation
      const { data, error } = await supabase.rpc('get_profile_details_for_pip', {
        input_profile_id: profileId // Use profile_id parameter instead of pip_id
      });

      if (error) {
        console.error('Error fetching profile details:', error);
        throw error;
      }

      if (!data || data.length === 0) return null;

      // The RPC function returns an array, so we take the first element
      const profileData = data[0] as RPCProfileResponse;

      console.log('Profile data received:', profileData);

      // The RPC function returns the data in the exact format we need
      return {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        employee_id: profileData.employee_id,
        profile_image: profileData.profile_image,
        sbu_name: profileData.sbu_name,
        expertise_name: profileData.expertise_name,
        manager_name: profileData.manager_name,
        manager_id: profileData.manager_id,
        current_designation: profileData.current_designation,
        resource_planning: profileData.resource_planning || [],
        total_utilization: profileData.total_utilization || 0
      };
    },
    enabled: !!profileId,
  });
}
