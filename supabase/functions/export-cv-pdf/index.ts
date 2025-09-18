import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template utilities - ported from frontend
const templateUtilities = {
  formatDate: (dateString: string, formatStr: string = 'MMM yyyy'): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      if (formatStr === 'MMM yyyy') {
        return `${month} ${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  },

  formatDateRange: (startDate: string, endDate: string | null, isCurrent?: boolean): string => {
    const formattedStart = templateUtilities.formatDate(startDate);
    
    if (isCurrent || !endDate) {
      return `${formattedStart} - Present`;
    }
    
    const formattedEnd = templateUtilities.formatDate(endDate);
    return `${formattedStart} - ${formattedEnd}`;
  },

  joinArray: (array: any[], separator: string = ', '): string => {
    if (!Array.isArray(array)) return '';
    return array.filter(item => item).join(separator);
  },

  truncate: (text: string, length: number = 100): string => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  },

  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  formatProficiency: (proficiency: number): string => {
    if (proficiency >= 9) return 'Expert';
    if (proficiency >= 7) return 'Advanced';
    if (proficiency >= 5) return 'Intermediate';
    if (proficiency >= 3) return 'Beginner';
    return 'Novice';
  },

  defaultValue: (value: any, defaultVal: string): string => {
    if (value === null || value === undefined || value === '') {
      return defaultVal;
    }
    return String(value);
  }
};

function applyUtilityFilter(value: any, filter: string, args?: string[]): string {
  const [utilityName, ...filterArgs] = filter.split(':');
  const allArgs = [...(filterArgs || []), ...(args || [])];

  switch (utilityName) {
    case 'formatDate':
      return templateUtilities.formatDate(value, allArgs[0]);
    case 'formatDateRange':
      return templateUtilities.formatDateRange(value, allArgs[0], allArgs[1] === 'true');
    case 'join':
      return templateUtilities.joinArray(value, allArgs[0]);
    case 'truncate':
      return templateUtilities.truncate(value, parseInt(allArgs[0]) || 100);
    case 'capitalize':
      return templateUtilities.capitalize(value);
    case 'formatProficiency':
      return templateUtilities.formatProficiency(value);
    case 'defaultValue':
      return templateUtilities.defaultValue(value, allArgs[0] || '');
    default:
      return String(value || '');
  }
}

// Complete Template processor class - ported from frontend
class TemplateProcessor {
  private debugMode: boolean;

  constructor(options: { debugMode?: boolean } = {}) {
    this.debugMode = options.debugMode || false;
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[TemplateProcessor] ${message}`, data);
    }
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private hasContent(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  private processVariable(template: string, data: any): string {
    // Handle variables with filters: {{employee.firstName | capitalize}}
    return template.replace(/\{\{employee\.([^}|\s]+)(\s*\|\s*([^}]+))?\}\}/g, (match, path, filterPart, filter) => {
      const value = this.getValue(data, path);
      this.log(`Processing variable: employee.${path}`, { value, filter });
      
      if (filter) {
        return applyUtilityFilter(value, filter.trim());
      }
      
      return String(value || '');
    });
  }

  private processLoopVariable(template: string, item: any, index: number): string {
    // Handle {{this.property}} and {{this.property | filter}}
    let processed = template.replace(/\{\{this\.([^}|\s]+)(\s*\|\s*([^}]+))?\}\}/g, (match, property, filterPart, filter) => {
      let value = item[property];
      
      // Handle special cases
      if (property === 'dateRange') {
        value = applyUtilityFilter(item.startDate, 'formatDateRange', [item.endDate, String(item.isCurrent)]);
      }
      
      this.log(`Processing loop variable: this.${property}`, { value, filter });
      
      if (filter) {
        return applyUtilityFilter(value, filter.trim());
      }
      
      // Handle arrays automatically
      if (Array.isArray(value)) {
        return applyUtilityFilter(value, 'join');
      }
      
      return String(value || '');
    });

    // Process conditionals within loop context (this. prefixed)
    processed = this.processLoopConditionals(processed, item);

    return processed;
  }

  private processLoopConditionals(template: string, item: any): string {
    // Handle {{#if this.property}} ... {{else}} ... {{/if}}
    template = template.replace(
      /\{\{#if this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        this.log(`Processing loop conditional: this.${path}`, { value, hasValue: !!value });
        
        return value ? ifContent : elseContent;
      }
    );

    // Handle {{#unless this.property}} ... {{else}} ... {{/unless}}
    template = template.replace(
      /\{\{#unless this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/unless\}\}/g,
      (match, path, unlessContent, elseContent = '') => {
        const value = this.getValue(item, path);
        this.log(`Processing loop unless conditional: this.${path}`, { value, hasValue: !!value });
        
        return !value ? unlessContent : elseContent;
      }
    );

    // Handle {{#ifNotEmpty this.property}} ... {{else}} ... {{/ifNotEmpty}}
    template = template.replace(
      /\{\{#ifNotEmpty this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifNotEmpty\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing loop ifNotEmpty conditional: this.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    // Handle {{#hasContent this.property}} ... {{else}} ... {{/hasContent}}
    template = template.replace(
      /\{\{#hasContent this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/hasContent\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing loop hasContent conditional: this.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    return template;
  }

  private processLoops(template: string, data: any): string {
    // Handle {{#each employee.arrayName}} ... {{/each}}
    return template.replace(
      /\{\{#each employee\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayName, loopContent) => {
        const array = this.getValue(data, arrayName);
        this.log(`Processing loop: employee.${arrayName}`, { array, arrayLength: array?.length });
        
        if (!Array.isArray(array) || array.length === 0) {
          return '';
        }

        return array.map((item, index) => {
          return this.processLoopVariable(loopContent, item, index);
        }).join('');
      }
    );
  }

  private processConditionals(template: string, data: any): string {
    // Handle {{#if employee.property}} ... {{else}} ... {{/if}}
    template = template.replace(
      /\{\{#if employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing conditional: employee.${path}`, { value, hasValue: !!value });
        
        return value ? ifContent : elseContent;
      }
    );

    // Handle {{#unless employee.property}} ... {{else}} ... {{/unless}}
    template = template.replace(
      /\{\{#unless employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/unless\}\}/g,
      (match, path, unlessContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing unless conditional: employee.${path}`, { value, hasValue: !!value });
        
        return !value ? unlessContent : elseContent;
      }
    );

    // Handle {{#ifNotEmpty employee.property}} ... {{else}} ... {{/ifNotEmpty}}
    template = template.replace(
      /\{\{#ifNotEmpty employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifNotEmpty\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing ifNotEmpty conditional: employee.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    // Handle {{#hasContent employee.property}} ... {{else}} ... {{/hasContent}}
    template = template.replace(
      /\{\{#hasContent employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/hasContent\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing hasContent conditional: employee.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    return template;
  }

  private processHelpers(template: string, data: any): string {
    // Handle {{#ifEquals employee.property "value"}} ... {{else}} ... {{/ifEquals}}
    template = template.replace(
      /\{\{#ifEquals employee\.([^}]+) "([^"]+)"\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifEquals\}\}/g,
      (match, path, compareValue, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing ifEquals: employee.${path} === "${compareValue}"`, { value, compareValue, matches: value === compareValue });
        
        return String(value) === compareValue ? ifContent : elseContent;
      }
    );

    return template;
  }

  private generateFullCVHTML(processedHTML: string, mode: 'fullscreen' | 'download' = 'fullscreen'): string {
    const baseStyles = `
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        line-height: 1.6; 
        background: #f5f5f5;
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

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV Preview</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${baseStyles}</style>
        </head>
        <body>
          ${processedHTML}
        </body>
      </html>
    `;
  }

  process(template: string, data: any): string {
    if (!template) return '';

    this.log('Starting template processing', { templateLength: template.length, hasData: !!data });

    try {
      let processed = template;

      // CRITICAL: Process loops FIRST, then conditionals
      // This ensures that conditionals within loops work correctly
      processed = this.processLoops(processed, data);
      processed = this.processConditionals(processed, data);
      processed = this.processHelpers(processed, data);
      processed = this.processVariable(processed, data);

      this.log('Template processing completed', { processedLength: processed.length });
      
      return processed;
    } catch (error) {
      this.log('Template processing error', error);
      throw new Error(`Template processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  processForCV(htmlTemplate: string, employeeData: any, templateConfig?: { orientation?: 'portrait' | 'landscape' }): string {
    const processed = this.process(htmlTemplate, employeeData);
    return this.generateFullCVHTML(processed, 'download');
  }
}

// Complete data mapper - ported from frontend
function mapEmployeeData(rawData: any): any {
  if (!rawData) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      biography: '',
      currentDesignation: '',
      profileImage: '',
      technicalSkills: [],
      specializedSkills: [],
      experiences: [],
      education: [],
      projects: [],
      trainings: [],
      achievements: []
    };
  }

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const safeArray = (value: any): any[] => {
    if (!Array.isArray(value)) return [];
    return value;
  };

  return {
    firstName: safeString(rawData.first_name || rawData.general_information?.first_name),
    lastName: safeString(rawData.last_name || rawData.general_information?.last_name),
    email: safeString(rawData.email),
    employeeId: safeString(rawData.employee_id),
    biography: safeString(rawData.biography || rawData.general_information?.biography),
    currentDesignation: safeString(rawData.current_designation || rawData.general_information?.current_designation),
    profileImage: safeString(rawData.profile_image || rawData.general_information?.profile_image),
    
    technicalSkills: safeArray(rawData.technical_skills).map((skill: any) => ({
      id: safeString(skill.id),
      name: safeString(skill.name),
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    specializedSkills: safeArray(rawData.specialized_skills).map((skill: any) => ({
      id: safeString(skill.id),
      name: safeString(skill.name),
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    experiences: safeArray(rawData.experiences).map((exp: any) => ({
      id: safeString(exp.id),
      companyName: safeString(exp.company_name),
      designation: safeString(exp.designation),
      startDate: safeString(exp.start_date),
      endDate: safeString(exp.end_date),
      isCurrent: exp.is_current || false,
      description: safeString(exp.description)
    })),
    
    education: safeArray(rawData.education).map((edu: any) => ({
      id: safeString(edu.id),
      university: safeString(edu.university),
      degree: safeString(edu.degree),
      department: safeString(edu.department),
      startDate: safeString(edu.start_date),
      endDate: safeString(edu.end_date),
      isCurrent: edu.is_current || false,
      gpa: safeString(edu.gpa)
    })),
    
    projects: safeArray(rawData.projects).map((proj: any) => ({
      id: safeString(proj.id),
      name: safeString(proj.name),
      role: safeString(proj.role),
      startDate: safeString(proj.start_date),
      endDate: safeString(proj.end_date),
      isCurrent: proj.is_current || false,
      description: safeString(proj.description),
      technologiesUsed: Array.isArray(proj.technologies_used) 
        ? proj.technologies_used.map((t: any) => safeString(t))
        : (proj.technologies_used ? safeString(proj.technologies_used).split(',').map((t: string) => t.trim()) : []),
      url: safeString(proj.url),
      displayOrder: proj.display_order || 0,
      responsibility: safeString(proj.responsibility)
    })),
    
    trainings: safeArray(rawData.trainings).map((training: any) => ({
      id: safeString(training.id),
      title: safeString(training.title),
      provider: safeString(training.provider),
      certificationDate: safeString(training.certification_date),
      description: safeString(training.description),
      certificateUrl: safeString(training.certificate_url)
    })),
    
    achievements: safeArray(rawData.achievements).map((achievement: any) => ({
      id: safeString(achievement.id),
      title: safeString(achievement.title),
      date: safeString(achievement.date),
      description: safeString(achievement.description)
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
    const requestBody: { profile_id: string; template_id: string } = await req.json();
    const { profile_id, template_id } = requestBody;

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
    const supabaseUrl: string = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey: string = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing CV export for profile: ${profile_id}, template: ${template_id}`);

    // Fetch data
    const dataFetcher = new DataFetcher(supabase);
    const { employeeData, templateData } = await dataFetcher.fetchAllData(profile_id, template_id);

    console.log(`Processing CV with template: ${templateData.name}, orientation: ${templateData.orientation}, data source: ${templateData.data_source_function}`);

    // Process template
    const processor = new TemplateProcessor({ debugMode: false });
    const mappedData: any = mapEmployeeData(employeeData);
    const processedHTML: string = processor.processForCV(
      templateData.html_template,
      mappedData,
      templateData
    );

    // Generate PDF
    const pdfBytes: Uint8Array = await generatePDFWithPuppeteer(processedHTML);

    // Return PDF directly as binary data
    const filename: string = `CV-${employeeData.first_name}-${employeeData.last_name}-${templateData.name}.pdf`;
    
    return new Response(pdfBytes as Uint8Array, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    });

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