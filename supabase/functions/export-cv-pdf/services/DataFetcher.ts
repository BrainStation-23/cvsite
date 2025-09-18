export class DataFetcher {
  private supabase: any;
  private static readonly AVAILABLE_RPC_FUNCTIONS = [
    'get_employee_data_masked',
    'get_employee_data'
  ];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async fetchEmployeeData(profileId: string, rpcFunctionName?: string, limits?: any): Promise<any> {
    const functionName = rpcFunctionName || 'get_employee_data_masked';
    
    if (!DataFetcher.AVAILABLE_RPC_FUNCTIONS.includes(functionName)) {
      console.warn(`Unknown RPC function: ${functionName}, falling back to default`);
      return this.fetchEmployeeData(profileId, 'get_employee_data_masked', limits);
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

    const { data, error } = await this.supabase.rpc(functionName, rpcParams);

    if (error) {
      console.error(`Error fetching employee data with ${functionName}:`, error);
      throw new Error(`Failed to fetch employee data: ${error.message}`);
    }

    if (!data) {
      throw new Error('Employee data not found');
    }

    const employeeData = data;

    // Ensure projects include responsibility field
    if (employeeData.projects) {
      employeeData.projects = employeeData.projects.map((project: any) => ({
        ...project,
        responsibility: project.responsibility || ''
      }));
    }

    return employeeData;
  }

  async fetchTemplateData(templateId: string): Promise<any> {
    const { data, error } = await this.supabase
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

    return data;
  }

  async fetchAllData(profileId: string, templateId: string): Promise<any> {
    const templateData = await this.fetchTemplateData(templateId);
    
    const limits = {
      technical_skills_limit: templateData.technical_skills_limit,
      specialized_skills_limit: templateData.specialized_skills_limit,
      experiences_limit: templateData.experiences_limit,
      education_limit: templateData.education_limit,
      trainings_limit: templateData.trainings_limit,
      achievements_limit: templateData.achievements_limit,
      projects_limit: templateData.projects_limit,
    };
    
    const employeeData = await this.fetchEmployeeData(
      profileId, 
      templateData.data_source_function,
      limits
    );

    return { employeeData, templateData };
  }
}
