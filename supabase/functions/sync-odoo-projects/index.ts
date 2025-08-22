
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OdooProject {
  id: string;
  name: string;
  description: string | null;
  companyId: number;
  projectLevel: string | null;
  projectType: string;
  projectValue: number;
  active: boolean;
}

interface OdooResponse {
  data: {
    allProjects: OdooProject[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting optimized Odoo projects sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const odooApiKey = Deno.env.get('ODOO_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Updated GraphQL query to fetch all new fields from Odoo
    const graphqlQuery = {
      query: `
        query {
          allProjects(includeArchived: true) {
            id
            name
            description
            companyId
            projectLevel
            projectType
            projectValue
            active
          }
        }
      `
    };

    console.log('Fetching projects from Odoo GraphQL API with updated query...');

    // Fetch projects from Odoo GraphQL API
    const odooResponse = await fetch('https://erp.brainstation-23.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': odooApiKey
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!odooResponse.ok) {
      throw new Error(`Odoo API request failed: ${odooResponse.status} ${odooResponse.statusText}`);
    }

    const odooData: OdooResponse = await odooResponse.json();
    console.log(`Fetched ${odooData.data.allProjects.length} projects from Odoo`);

    // Pre-process the data for bulk operations with all new fields
    const processedProjects = odooData.data.allProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      companyId: project.companyId || 0,
      projectLevel: project.projectLevel,
      projectType: project.projectType,
      projectValue: project.projectValue || null,
      active: project.active
    }));

    console.log(`Pre-processed ${processedProjects.length} projects, calling bulk sync function...`);

    // Call the bulk sync RPC function
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'bulk_sync_odoo_projects',
      { projects_data: processedProjects }
    );

    if (syncError) {
      throw new Error(`Bulk sync function failed: ${syncError.message}`);
    }

    console.log('Bulk sync completed successfully:', syncResult);

    // Return the result from the RPC function
    return new Response(JSON.stringify({
      success: true,
      message: 'Projects sync completed using bulk processing with updated fields',
      stats: {
        total_fetched: odooData.data.allProjects.length,
        ...syncResult.stats
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
