
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
    console.log('Starting Odoo projects sync...');

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

    // Log sample data structure from Odoo
    if (odooData.data.allProjects.length > 0) {
      console.log('Sample Odoo project data:', JSON.stringify(odooData.data.allProjects[0], null, 2));
    }

    // Transform Odoo data to match the expected structure (already correct, just ensure proper null handling)
    const transformedProjects = odooData.data.allProjects.map(project => ({
      name: project.name,
      description: project.description,
      projectLevel: project.projectLevel,
      projectType: project.projectType,
      projectValue: project.projectValue,
      active: project.active,
      projectManager: project.projectManager ? {
        name: project.projectManager.name,
        email: project.projectManager.email
      } : null
    }));

    console.log(`Transformed ${transformedProjects.length} projects for bulk sync`);
    console.log('Sample transformed data:', JSON.stringify(transformedProjects[0], null, 2));

    console.log('Calling bulk-sync-odoo-projects function...');

    // Call the bulk sync function
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('bulk-sync-odoo-projects', {
      body: {
        projects_data: transformedProjects
      }
    });

    if (syncError) {
      console.error('Bulk sync function error:', syncError);
      throw new Error(`Bulk sync function failed: ${syncError.message}`);
    }

    console.log('Bulk sync completed successfully:', JSON.stringify(syncResult, null, 2));

    // Return the result from the bulk sync function
    return new Response(JSON.stringify({
      success: true,
      message: 'Projects sync completed',
      stats: {
        total_fetched: odooData.data.allProjects.length,
        total_processed: syncResult?.stats?.total_processed || 0,
        new_synced: syncResult?.stats?.new_synced || 0,
        updated: syncResult?.stats?.updated || 0,
        skipped: syncResult?.stats?.skipped || 0,
        errors: syncResult?.stats?.errors || 0
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
