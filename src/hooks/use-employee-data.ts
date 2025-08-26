
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

export interface EmployeeDataLimits {
  technical_skills_limit?: number;
  specialized_skills_limit?: number;
  experiences_limit?: number;
  education_limit?: number;
  trainings_limit?: number;
  achievements_limit?: number;
  projects_limit?: number;
}

export function useEmployeeData(
  profileId: string, 
  masked: boolean = false,
  limits?: EmployeeDataLimits
) {
  const rpcFunction = masked ? 'get_employee_data_masked' : 'get_employee_data';
  const queryKey = masked ? 
    ['employee-data-masked', profileId, limits] : 
    ['employee-data', profileId, limits];

  return useQuery({
    queryKey,
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

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);

      if (error) {
        console.error(`Error fetching ${masked ? 'masked ' : ''}employee data:`, error);
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

      console.log(`${masked ? 'Masked ' : ''}Employee data fetched:`, employeeData);
      return employeeData;
    },
    enabled: !!profileId,
  });
}
