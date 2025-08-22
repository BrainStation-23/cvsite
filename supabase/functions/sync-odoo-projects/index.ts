
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
  projectManager: OdooProjectManager;
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

    // Pass the data directly to the RPC function - no processing here
    console.log('Calling bulk sync RPC function...');
    const { data: syncResult, error: syncError } = await supabase.functions.invoke(
      'bulk-sync-odoo-projects-v2',
      { 
        body: { projects_data: odooData.data.allProjects }
      }
    );

    if (syncError) {
      console.error('RPC function error:', syncError);
      throw new Error(`Bulk sync RPC function failed: ${syncError.message}`);
    }

    console.log('Sync completed successfully:', syncResult);

    // Return the result from the RPC function
    return new Response(JSON.stringify({
      success: true,
      message: 'Projects sync completed',
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
