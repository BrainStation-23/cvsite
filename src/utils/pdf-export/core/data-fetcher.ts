
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { CVTemplate } from '@/hooks/use-cv-templates';
import { EmployeeDataLimits } from '@/hooks/use-employee-data';

export interface FetchedData {
  employeeData: EmployeeProfile;
  templateData: CVTemplate;
}

export class DataFetcher {
  // Available RPC functions for fetching employee data
  private static readonly AVAILABLE_RPC_FUNCTIONS = [
    'get_employee_data_masked',
    'get_employee_data'
  ] as const;

  private static typeOfRpcName(name: typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number]) { return name; }

  async fetchEmployeeData(
    profileId: string, 
    rpcFunctionName?: typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number], 
    limits?: EmployeeDataLimits
  ): Promise<EmployeeProfile> {
    // Use provided RPC function name or default to masked version
    const functionName: typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number] = rpcFunctionName || 'get_employee_data_masked';
    
    // Validate that the RPC function is in our allowed list
    if (!DataFetcher.AVAILABLE_RPC_FUNCTIONS.includes(functionName)) {
      console.warn(`Unknown RPC function: ${functionName}, falling back to default`);
      const fallbackFunction: typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number] = 'get_employee_data_masked';
      return this.fetchEmployeeData(profileId, fallbackFunction, limits);
    }

    console.log(`Fetching employee data using RPC function: ${functionName}`);

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

    const { data, error } = await supabase.rpc(functionName, rpcParams);

    if (error) {
      console.error(`Error fetching employee data with ${functionName}:`, error);
      throw new Error(`Failed to fetch employee data: ${error.message}`);
    }

    if (!data) {
      throw new Error('Employee data not found');
    }

    const employeeData = data as unknown as EmployeeProfile;

    // Ensure projects include responsibility field
    if (employeeData.projects) {
      employeeData.projects = employeeData.projects.map((project) => ({
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
    // First fetch template data to get the RPC function name and limits
    const templateData = await this.fetchTemplateData(templateId);
    
    // Create limits object from template data
    const limits: EmployeeDataLimits = {
      technical_skills_limit: templateData.technical_skills_limit,
      specialized_skills_limit: templateData.specialized_skills_limit,
      experiences_limit: templateData.experiences_limit,
      education_limit: templateData.education_limit,
      trainings_limit: templateData.trainings_limit,
      achievements_limit: templateData.achievements_limit,
      projects_limit: templateData.projects_limit,
    };
    
    // Then fetch employee data using the specified RPC function and limits
    const rpcName: typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number] =
      (DataFetcher.AVAILABLE_RPC_FUNCTIONS as readonly string[]).includes(templateData.data_source_function)
        ? (templateData.data_source_function as typeof DataFetcher.AVAILABLE_RPC_FUNCTIONS[number])
        : 'get_employee_data_masked';

    const employeeData = await this.fetchEmployeeData(
      profileId,
      rpcName,
      limits
    );

    return { employeeData, templateData };
  }

  // Static method to get available RPC functions
  static getAvailableRPCFunctions(): string[] {
    return [...DataFetcher.AVAILABLE_RPC_FUNCTIONS];
  }
}

export const dataFetcher = new DataFetcher();
