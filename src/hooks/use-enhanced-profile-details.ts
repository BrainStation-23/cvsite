
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDetails } from '@/types/pip';

export function useEnhancedProfileDetails(profileId: string | null) {
  return useQuery({
    queryKey: ['enhanced-profile-details', profileId],
    queryFn: async (): Promise<ProfileDetails | null> => {
      if (!profileId) return null;

      // Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          employee_id,
          sbu:sbus(name),
          expertise_type:expertise_types(name),
          manager_profile:profiles!profiles_manager_fkey(
            id,
            first_name,
            last_name,
            general_information(first_name, last_name)
          ),
          general_information(current_designation, profile_image)
        `)
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('Error fetching profile details:', profileError);
        throw profileError;
      }

      // Fetch resource planning data from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: resourceData, error: resourceError } = await supabase
        .from('resource_planning')
        .select(`
          id,
          engagement_percentage,
          billing_percentage,
          engagement_start_date,
          release_date,
          engagement_complete,
          project:projects_management(project_name, client_name, project_manager),
          bill_type:bill_types(name)
        `)
        .eq('profile_id', profileId)
        .gte('engagement_start_date', threeMonthsAgo.toISOString().split('T')[0])
        .order('engagement_start_date', { ascending: false });

      if (resourceError) {
        console.error('Error fetching resource planning:', resourceError);
        // Don't throw here, just log the error and continue with empty array
      }

      if (!profileData) return null;

      // Handle manager profile data
      const managerProfile = Array.isArray(profileData.manager_profile) 
        ? profileData.manager_profile[0] 
        : profileData.manager_profile;

      // Process resource planning data
      const resourcePlanning = (resourceData || []).map((item: any) => ({
        id: item.id,
        project_name: item.project?.project_name || null,
        client_name: item.project?.client_name || null,
        project_manager: item.project?.project_manager || null,
        engagement_percentage: item.engagement_percentage || 0,
        billing_percentage: item.billing_percentage || 0,
        bill_type_name: item.bill_type?.name || null,
        engagement_start_date: item.engagement_start_date,
        release_date: item.release_date,
        is_current: !item.engagement_complete
      }));

      // Calculate total utilization
      const totalUtilization = resourcePlanning
        .filter(item => item.is_current)
        .reduce((sum, item) => sum + item.engagement_percentage, 0);

      return {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        employee_id: profileData.employee_id,
        profile_image: profileData.general_information?.profile_image || null,
        sbu_name: profileData.sbu?.name || null,
        expertise_name: profileData.expertise_type?.name || null,
        manager_name: managerProfile 
          ? `${managerProfile.general_information?.first_name || managerProfile.first_name || ''} ${managerProfile.general_information?.last_name || managerProfile.last_name || ''}`.trim()
          : null,
        manager_id: managerProfile?.id || null,
        current_designation: profileData.general_information?.current_designation || null,
        resource_planning: resourcePlanning,
        total_utilization: Math.min(totalUtilization, 100)
      };
    },
    enabled: !!profileId,
  });
}
