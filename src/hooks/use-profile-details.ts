
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
          manager_profile:profiles!profiles_manager_fkey(
            first_name,
            last_name,
            general_information(first_name, last_name)
          ),
          general_information(current_designation)
        `)
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile details:', error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        employee_id: data.employee_id,
        sbu_name: data.sbu?.name || null,
        expertise_name: data.expertise_type?.name || null,
        manager_name: data.manager_profile 
          ? `${data.manager_profile.general_information?.first_name || data.manager_profile.first_name || ''} ${data.manager_profile.general_information?.last_name || data.manager_profile.last_name || ''}`.trim()
          : null,
        current_designation: data.general_information?.current_designation || null,
      };
    },
    enabled: !!profileId,
  });
}
