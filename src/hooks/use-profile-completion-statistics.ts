
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileCompletionStatistics {
  total_profiles: number;
  avg_completion_rate: number;
  profiles_above_50_percent: number;
  profiles_above_75_percent: number;
  resource_type_breakdown: Array<{
    resource_type_id: string | null;
    resource_type_name: string;
    total_profiles: number;
    avg_completion_rate: number;
  }>;
}

export const useProfileCompletionStatistics = () => {
  return useQuery({
    queryKey: ['profile-completion-statistics'],
    queryFn: async (): Promise<ProfileCompletionStatistics> => {
      console.log('Fetching profile completion statistics...');
      
      const { data, error } = await supabase.rpc('get_profile_completion_statistics');

      if (error) {
        console.error('Error fetching profile completion statistics:', error);
        throw error;
      }

      console.log('Profile completion statistics data:', data);

      // The RPC returns a single row with all the statistics
      const result = data?.[0];
      if (!result) {
        return {
          total_profiles: 0,
          avg_completion_rate: 0,
          profiles_above_50_percent: 0,
          profiles_above_75_percent: 0,
          resource_type_breakdown: [],
        };
      }

      return {
        total_profiles: result.total_profiles || 0,
        avg_completion_rate: result.avg_completion_rate || 0,
        profiles_above_50_percent: result.profiles_above_50_percent || 0,
        profiles_above_75_percent: result.profiles_above_75_percent || 0,
        resource_type_breakdown: result.resource_type_breakdown || [],
      };
    },
  });
};
