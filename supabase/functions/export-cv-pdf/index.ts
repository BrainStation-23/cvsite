import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template processor class - ported from frontend
class TemplateProcessor {
  private debugMode: boolean;

  constructor(options: { debugMode?: boolean } = {}) {
    this.debugMode = options.debugMode || false;
  }

  process(template: string, data: any): string {
    if (this.debugMode) {
      console.log('Processing template with data:', { template: template.substring(0, 100), data });
    }

    let processed = template;

    // Process loops first (before individual variable substitutions)
    processed = this.processLoops(processed, data);
    
    // Then process individual variables
    processed = this.processVariables(processed, data);

    return processed;
  }

  processForCV(template: string, data: any, templateConfig: any): string {
    // Add CSS for different orientations
    const orientationCSS = this.getOrientationCSS(templateConfig.orientation);
    
    let processed = this.process(template, data);
    
    // Inject orientation-specific CSS
    if (processed.includes('</head>')) {
      processed = processed.replace('</head>', `<style>${orientationCSS}</style></head>`);
    } else {
      processed = `<style>${orientationCSS}</style>${processed}`;
    }

    return processed;
  }

  private processLoops(template: string, data: any): string {
    const loopRegex = /\{\{\#each\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(loopRegex, (match, arrayName, loopContent) => {
      const array = this.getNestedValue(data, arrayName);
      
      if (!Array.isArray(array)) {
        if (this.debugMode) {
          console.warn(`Loop variable "${arrayName}" is not an array:`, array);
        }
        return '';
      }

      return array.map((item, index) => {
        let itemContent = loopContent;
        
        // Replace loop variables like {{this.name}}, {{name}}, {{@index}}
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (match, prop) => {
          return this.getNestedValue(item, prop) || '';
        });
        
        itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
          if (prop === '@index') return index.toString();
          return this.getNestedValue(item, prop) || this.getNestedValue(data, prop) || '';
        });

        return itemContent;
      }).join('');
    });
  }

  private processVariables(template: string, data: any): string {
    return template.replace(/\{\{([^#\/][^}]*)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim();
      const value = this.getNestedValue(data, trimmedVar);
      
      if (this.debugMode && value === undefined) {
        console.warn(`Variable "${trimmedVar}" not found in data`);
      }
      
      return value !== undefined ? String(value) : '';
    });
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  private getOrientationCSS(orientation: string): string {
    const baseCSS = `
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        line-height: 1.6; 
        background: white;
      }
      @media print {
        body { 
          background: white; 
          padding: 0; 
        }
        .cv-container {
          box-shadow: none !important;
          transform: none !important;
          margin: 0 !important;
        }
      }
    `;

    if (orientation === 'landscape') {
      return baseCSS + `
        @page {
          size: A4 landscape;
          margin: 1cm;
        }
        .cv-container {
          max-width: 100%;
          min-height: 19cm;
        }
      `;
    } else {
      return baseCSS + `
        @page {
          size: A4 portrait;
          margin: 1cm;
        }
        .cv-container {
          max-width: 19cm;
          min-height: 26cm;
        }
      `;
    }
  }
}

// Data mapper - ported from frontend
function mapEmployeeData(employeeData: any): any {
  if (!employeeData) return {};

  return {
    // Personal Information
    first_name: employeeData.first_name || '',
    last_name: employeeData.last_name || '',
    employee_id: employeeData.employee_id || '',
    email: employeeData.email || '',
    full_name: employeeData.first_name && employeeData.last_name 
      ? `${employeeData.first_name} ${employeeData.last_name}` 
      : employeeData.first_name || employeeData.last_name || '',
    
    // General Information
    biography: employeeData.general_information?.biography || '',
    current_designation: employeeData.general_information?.current_designation || '',
    profile_image: employeeData.general_information?.profile_image || '',
    
    // Technical Skills
    technical_skills: employeeData.technical_skills || [],
    
    // Specialized Skills  
    specialized_skills: employeeData.specialized_skills || [],
    
    // Experiences
    experiences: (employeeData.experiences || []).map((exp: any) => ({
      ...exp,
      company_name: exp.company_name || '',
      designation: exp.designation || '',
      description: exp.description || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: exp.is_current || false
    })),
    
    // Education
    education: (employeeData.education || []).map((edu: any) => ({
      ...edu,
      university: edu.university || '',
      degree: edu.degree || '',
      department: edu.department || '',
      gpa: edu.gpa || '',
      start_date: edu.start_date || '',
      end_date: edu.end_date || '',
      is_current: edu.is_current || false
    })),
    
    // Training/Certifications
    trainings: (employeeData.trainings || []).map((training: any) => ({
      ...training,
      title: training.title || '',
      provider: training.provider || '',
      description: training.description || '',
      certification_date: training.certification_date || '',
      certificate_url: training.certificate_url || ''
    })),
    
    // Achievements
    achievements: (employeeData.achievements || []).map((achievement: any) => ({
      ...achievement,
      title: achievement.title || '',
      description: achievement.description || '',
      date: achievement.date || ''
    })),
    
    // Projects
    projects: (employeeData.projects || []).map((project: any) => ({
      ...project,
      name: project.name || '',
      role: project.role || '',
      description: project.description || '',
      responsibility: project.responsibility || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      is_current: project.is_current || false,
      technologies_used: project.technologies_used || [],
      url: project.url || ''
    }))
  };
}

// Data fetcher class - adapted for edge function
class DataFetcher {
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

// PDF generation using Puppeteer service
async function generatePDFWithPuppeteer(htmlContent: string): Promise<Uint8Array> {
  const puppeteerServiceUrl = Deno.env.get('PUPPETEER_SERVICE_URL') || 'https://puppeteer.brainstation-23.xyz';
  const timeout = parseInt(Deno.env.get('PUPPETEER_TIMEOUT') || '30000');
  
  console.log('Generating PDF with Puppeteer service...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(puppeteerServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'Accept': 'application/pdf'
      },
      body: htmlContent,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Puppeteer service error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/pdf')) {
      throw new Error(`Unexpected response type: ${contentType}. Expected application/pdf`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('PDF generation timed out');
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { profile_id, template_id } = await req.json();

    if (!profile_id || !template_id) {
      return new Response(
        JSON.stringify({ error: 'profile_id and template_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing CV export for profile: ${profile_id}, template: ${template_id}`);

    // Fetch data
    const dataFetcher = new DataFetcher(supabase);
    const { employeeData, templateData } = await dataFetcher.fetchAllData(profile_id, template_id);

    console.log(`Processing CV with template: ${templateData.name}, orientation: ${templateData.orientation}, data source: ${templateData.data_source_function}`);

    // Process template
    const processor = new TemplateProcessor({ debugMode: false });
    const mappedData = mapEmployeeData(employeeData);
    const processedHTML = processor.processForCV(
      templateData.html_template,
      mappedData,
      templateData
    );

    // Generate PDF
    const pdfBytes = await generatePDFWithPuppeteer(processedHTML);

    // Return PDF as base64
    const base64PDF = btoa(String.fromCharCode(...pdfBytes));

    return new Response(
      JSON.stringify({ 
        success: true,
        pdf: base64PDF,
        filename: `CV-${employeeData.first_name}-${employeeData.last_name}-${templateData.name}.pdf`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('CV export failed:', error);
    
    // Check if it's a Puppeteer service error
    if (error.message.includes('Puppeteer service')) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation service is currently unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'CV export failed',
        code: 'EXPORT_FAILED'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});