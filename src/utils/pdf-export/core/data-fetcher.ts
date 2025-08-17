
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { CVTemplate } from '@/hooks/use-cv-templates';

export interface FetchedData {
  employeeData: EmployeeProfile;
  templateData: CVTemplate;
}

export class DataFetcher {
  async fetchEmployeeData(profileId: string): Promise<EmployeeProfile> {
    const { data, error } = await supabase.rpc('get_employee_data_masked', {
      profile_uuid: profileId
    });

    if (error) {
      console.error('Error fetching masked employee data:', error);
      throw new Error(`Failed to fetch employee data: ${error.message}`);
    }

    if (!data) {
      throw new Error('Employee data not found');
    }

    const employeeData = data as unknown as EmployeeProfile;

    // Ensure projects include responsibility field
    if (employeeData.projects) {
      employeeData.projects = employeeData.projects.map((project: any) => ({
        ...project,
        responsibility: project.responsibility || ''
      }));
    }

    return employeeData;
  }

  async fetchTemplateData(templateId: string): Promise<CVTemplate> {
    const { data, error } = await supabase
      .from('cv_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching CV template:', error);
      throw new Error(`Failed to fetch CV template: ${error.message}`);
    }

    if (!data) {
      throw new Error('CV template not found');
    }

    return data as CVTemplate;
  }

  async fetchAllData(profileId: string, templateId: string): Promise<FetchedData> {
    const [employeeData, templateData] = await Promise.all([
      this.fetchEmployeeData(profileId),
      this.fetchTemplateData(templateId)
    ]);

    return { employeeData, templateData };
  }
}

export const dataFetcher = new DataFetcher();
