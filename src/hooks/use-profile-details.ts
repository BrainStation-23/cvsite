
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDetails } from '@/types/pip';

export function useProfileDetails(profileId: string | null) {
  return useQuery({
    queryKey: ['profile-details', profileId],
    queryFn: async (): Promise<ProfileDetails | null> => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          employee_id,
          sbu:sbus(name),
          expertise_type:expertise_types(name),
          manager_profile:profiles!manager(
            id,
            first_name,
            last_name,
            general_information(first_name, last_name)
          ),
          general_information(current_designation, profile_image)
        `)
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile details:', error);
        throw error;
      }

      if (!data) return null;

      // Handle manager profile data - it should be a single object, not an array
      const managerProfile = Array.isArray(data.manager_profile) 
        ? data.manager_profile[0] 
        : data.manager_profile;

      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        employee_id: data.employee_id,
        profile_image: data.general_information?.profile_image || null,
        sbu_name: data.sbu?.name || null,
        expertise_name: data.expertise_type?.name || null,
        manager_name: managerProfile 
          ? `${managerProfile.general_information?.first_name || managerProfile.first_name || ''} ${managerProfile.general_information?.last_name || managerProfile.last_name || ''}`.trim()
          : null,
        manager_id: managerProfile?.id || null,
        current_designation: data.general_information?.current_designation || null,
        resource_planning: [], // Empty array as this hook doesn't fetch resource planning
        total_utilization: 0, // Default to 0 as this hook doesn't calculate utilization
      };
    },
    enabled: !!profileId,
  });
}
