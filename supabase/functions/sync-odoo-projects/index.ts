
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OdooProject {
  name: string;
  projectValue: number;
  projectType: string;
  projectManager: {
    name: string;
    email: string;
  };
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
    console.log('Starting Odoo projects sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const odooApiKey = Deno.env.get('ODOO_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GraphQL query to fetch projects from Odoo
    const graphqlQuery = {
      query: `
        query {
          allProjects(includeArchived: true){
            name
            projectValue
            projectType
            projectManager {
              name
              email
            }
            active
          }
        }
      `
    };

    console.log('Fetching projects from Odoo...');

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

    // Get existing projects from our database to avoid duplicates
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects_management')
      .select('project_name, project_manager, project_type, client_name');

    if (fetchError) {
      throw new Error(`Failed to fetch existing projects: ${fetchError.message}`);
    }

    const existingProjectNames = new Set(existingProjects?.map(p => p.project_name) || []);
    
    // Process and sync projects
    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const odooProject of odooData.data.allProjects) {
      try {
        // Find project manager UUID by email if available
        let projectManagerId = null;
        if (odooProject.projectManager?.email) {
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', odooProject.projectManager.email)
            .single();
          
          projectManagerId = managerProfile?.id || null;
        }

        // Find project type UUID by name if available
        let projectTypeId = null;
        if (odooProject.projectType) {
          const { data: projectType } = await supabase
            .from('project_types')
            .select('id')
            .eq('name', odooProject.projectType)
            .single();
          
          projectTypeId = projectType?.id || null;
          
          if (!projectTypeId) {
            console.log(`Project type "${odooProject.projectType}" not found for project: ${odooProject.name}`);
          }
        }

        const projectData = {
          project_name: odooProject.name,
          client_name: null, // Odoo doesn't provide client info in this query
          project_manager: projectManagerId,
          project_type: projectTypeId,
          budget: odooProject.projectValue || null,
          is_active: odooProject.active
        };

        if (existingProjectNames.has(odooProject.name)) {
          // Update existing project
          const { error: updateError } = await supabase
            .from('projects_management')
            .update({
              project_manager: projectManagerId,
              project_type: projectTypeId,
              budget: odooProject.projectValue || null,
              is_active: odooProject.active,
              updated_at: new Date().toISOString()
            })
            .eq('project_name', odooProject.name);

          if (updateError) {
            console.error(`Failed to update project ${odooProject.name}:`, updateError);
          } else {
            updatedCount++;
            console.log(`Updated project: ${odooProject.name} with project type: ${odooProject.projectType}`);
          }
        } else {
          // Insert new project
          const { error: insertError } = await supabase
            .from('projects_management')
            .insert(projectData);

          if (insertError) {
            console.error(`Failed to insert project ${odooProject.name}:`, insertError);
          } else {
            syncedCount++;
            console.log(`Synced new project: ${odooProject.name} with project type: ${odooProject.projectType}`);
          }
        }
      } catch (projectError) {
        console.error(`Error processing project ${odooProject.name}:`, projectError);
        skippedCount++;
      }
    }

    const result = {
      success: true,
      message: 'Projects sync completed',
      stats: {
        total_fetched: odooData.data.allProjects.length,
        new_synced: syncedCount,
        updated: updatedCount,
        skipped: skippedCount
      }
    };

    console.log('Sync completed:', result);

    return new Response(JSON.stringify(result), {
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
