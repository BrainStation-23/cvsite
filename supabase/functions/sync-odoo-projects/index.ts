
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OdooProjectManager {
  name: string;
  email: string;
}

interface OdooProject {
  name: string;
  description: string | null;
  projectLevel: string | null;
  projectType: string;
  projectValue: number;
  active: boolean;
  projectManager: OdooProjectManager | null;
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
    console.log('Starting enhanced Odoo projects sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const odooApiKey = Deno.env.get('ODOO_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GraphQL query to fetch projects from Odoo
    const graphqlQuery = {
      query: `
        query AllProjects {
          allProjects(includeArchived: true) {
            name
            description
            projectLevel
            projectType
            projectValue
            active
            projectManager {
              name
              email
            }
          }
        }
      `
    };

    console.log('Fetching projects from Odoo GraphQL API...');

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

    // Convert data to JSONB format for the new RPC function
    const projectsJsonb = odooData.data.allProjects.map(project => ({
      projectName: project.name,
      clientName: '', // Not available in Odoo data, keeping empty
      description: project.description,
      projectLevel: project.projectLevel,
      projectType: project.projectType,
      projectValue: project.projectValue,
      active: project.active,
      managerName: project.projectManager?.name || '',
      managerEmail: project.projectManager?.email || ''
    }));

    console.log(`Prepared ${projectsJsonb.length} projects for bulk sync`);
    console.log('Sample project data:', JSON.stringify(projectsJsonb[0], null, 2));

    // Call the enhanced bulk sync RPC function
    const { data: syncResult, error: syncError } = await supabase.rpc('bulk_sync_odoo_projects', {
      projects_data: projectsJsonb
    });

    if (syncError) {
      console.error('Bulk sync RPC function error:', syncError);
      throw new Error(`Bulk sync RPC function failed: ${syncError.message}`);
    }

    console.log('Enhanced bulk sync completed successfully:', syncResult);

    // Return enhanced response with detailed statistics
    return new Response(JSON.stringify({
      success: true,
      message: 'Enhanced projects sync completed successfully',
      stats: {
        total_fetched: odooData.data.allProjects.length,
        total_processed: syncResult?.stats?.total_processed || 0,
        new_synced: syncResult?.stats?.inserted || 0,
        updated: syncResult?.stats?.updated || 0,
        skipped: syncResult?.stats?.skipped || 0,
        errors: syncResult?.error_projects ? syncResult.error_projects.length : 0
      },
      error_details: syncResult?.error_projects || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Enhanced sync error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred during enhanced sync'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
