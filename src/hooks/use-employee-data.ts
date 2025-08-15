
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

export function useEmployeeData(profileId: string) {
  return useQuery({
    queryKey: ['employee-data', profileId],
    queryFn: async (): Promise<EmployeeProfile | null> => {
      if (!profileId) return null;

      const { data, error } = await supabase.rpc('get_employee_data', {
        profile_uuid: profileId
      });

      if (error) {
        console.error('Error fetching employee data:', error);
        throw error;
      }

      if (!data) return null;

      // Type assertion to ensure we get the correct type
      const employeeData = data as EmployeeProfile;

      // Ensure projects include responsibility field
      if (employeeData.projects) {
        employeeData.projects = employeeData.projects.map((project: any) => ({
          ...project,
          // Ensure responsibility field is included, with fallback to empty string
          responsibility: project.responsibility || ''
        }));
      }

      console.log('Employee data fetched:', employeeData);
      return employeeData;
    },
    enabled: !!profileId,
  });
}
