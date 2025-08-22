
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { CVTemplate } from '@/hooks/use-cv-templates';

export interface FetchedData {
  employeeData: EmployeeProfile;
  templateData: CVTemplate;
}

export class DataFetcher {
  // Available RPC functions for fetching employee data
  private static readonly AVAILABLE_RPC_FUNCTIONS = [
    'get_employee_data_masked',
    'get_employee_data'
  ];

  async fetchEmployeeData(profileId: string, rpcFunctionName?: string): Promise<EmployeeProfile> {
    // Use provided RPC function name or default to masked version
    const functionName = rpcFunctionName || 'get_employee_data_masked';
    
    // Validate that the RPC function is in our allowed list
    if (!DataFetcher.AVAILABLE_RPC_FUNCTIONS.includes(functionName)) {
      console.warn(`Unknown RPC function: ${functionName}, falling back to default`);
      const fallbackFunction = 'get_employee_data_masked';
      return this.fetchEmployeeData(profileId, fallbackFunction);
    }

    console.log(`Fetching employee data using RPC function: ${functionName}`);

    const { data, error } = await supabase.rpc(functionName as any, {
      profile_uuid: profileId
    });

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
    // First fetch template data to get the RPC function name
    const templateData = await this.fetchTemplateData(templateId);
    
    // Then fetch employee data using the specified RPC function
    const employeeData = await this.fetchEmployeeData(profileId, templateData.data_source_function);

    return { employeeData, templateData };
  }

  // Static method to get available RPC functions
  static getAvailableRPCFunctions(): string[] {
    return [...DataFetcher.AVAILABLE_RPC_FUNCTIONS];
  }
}

export const dataFetcher = new DataFetcher();
