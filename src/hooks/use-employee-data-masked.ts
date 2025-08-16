
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

export function useEmployeeDataMasked(profileId: string) {
  return useQuery({
    queryKey: ['employee-data-masked', profileId],
    queryFn: async (): Promise<EmployeeProfile | null> => {
      if (!profileId) return null;

      const { data, error } = await supabase.rpc('get_employee_data_masked', {
        profile_uuid: profileId
      });

      if (error) {
        console.error('Error fetching masked employee data:', error);
        throw error;
      }

      if (!data) return null;

      // Proper type conversion: Json -> unknown -> EmployeeProfile
      const employeeData = data as unknown as EmployeeProfile;

      // Ensure projects include responsibility field
      if (employeeData.projects) {
        employeeData.projects = employeeData.projects.map((project: any) => ({
          ...project,
          // Ensure responsibility field is included, with fallback to empty string
          responsibility: project.responsibility || ''
        }));
      }

      console.log('Masked employee data fetched:', employeeData);
      return employeeData;
    },
    enabled: !!profileId,
  });
}
