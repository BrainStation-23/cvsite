
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEmployeeData(profileId: string) {
  return useQuery({
    queryKey: ['employee-data', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase.rpc('get_employee_data', {
        profile_id: profileId
      });

      if (error) {
        console.error('Error fetching employee data:', error);
        throw error;
      }

      // Ensure projects include responsibility field
      if (data && data.projects) {
        data.projects = data.projects.map((project: any) => ({
          ...project,
          // Ensure responsibility field is included, with fallback to empty string
          responsibility: project.responsibility || ''
        }));
      }

      console.log('Employee data fetched:', data);
      return data;
    },
    enabled: !!profileId,
  });
}
