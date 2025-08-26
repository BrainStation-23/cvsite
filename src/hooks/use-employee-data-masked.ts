
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { EmployeeDataLimits } from './use-employee-data';

export function useEmployeeDataMasked(profileId: string, limits?: EmployeeDataLimits) {
  return useQuery({
    queryKey: ['employee-data-masked', profileId, limits],
    queryFn: async (): Promise<EmployeeProfile | null> => {
      if (!profileId) return null;

      const rpcParams = {
        profile_uuid: profileId,
        ...(limits && {
          technical_skills_limit: limits.technical_skills_limit || 5,
          specialized_skills_limit: limits.specialized_skills_limit || 5,
          experiences_limit: limits.experiences_limit || 5,
          education_limit: limits.education_limit || 5,
          trainings_limit: limits.trainings_limit || 5,
          achievements_limit: limits.achievements_limit || 5,
          projects_limit: limits.projects_limit || 5,
        })
      };

      const { data, error } = await supabase.rpc('get_employee_data_masked', rpcParams);

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
