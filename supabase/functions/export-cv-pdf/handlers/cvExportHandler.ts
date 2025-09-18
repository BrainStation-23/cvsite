import { corsHeaders } from "../constants/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';
import { DataFetcher } from "../services/DataFetcher.ts";
import TemplateProcessor from "../templating/TemplateProcessor.ts";
import { mapEmployeeData } from "../mappers/employeeMapper.ts";
import { generatePDFWithPuppeteer } from "../services/pdf.ts";

export async function handleCvExport(req: Request): Promise<Response> {
  try {
    const requestBody: { profile_id: string; template_id: string } = await req.json();
    const { profile_id, template_id } = requestBody;

    if (!profile_id || !template_id) {
      return new Response(
        JSON.stringify({ error: 'profile_id and template_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

  } catch (error: any) {
    console.error('CV export failed:', error);
    
    // Check if it's a Puppeteer service error
    if (error.message?.includes('Puppeteer service')) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF generation service is currently unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'CV export failed',
        code: 'EXPORT_FAILED'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
