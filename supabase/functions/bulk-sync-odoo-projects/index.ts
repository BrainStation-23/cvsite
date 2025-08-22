
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectManagerData {
  name?: string;
  email?: string;
}

interface OdooProjectData {
  name: string;
  description: string | null;
  projectLevel: string | null;
  projectType: string;
  projectValue: number;
  active: boolean;
  projectManager: ProjectManagerData | null;
}

interface SyncStats {
  total_processed: number;
  new_synced: number;
  updated: number;
  skipped: number;
  errors: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting bulk sync of Odoo projects...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { projects_data } = await req.json();
    
    if (!projects_data || !Array.isArray(projects_data)) {
      throw new Error('Invalid projects_data format');
    }

    console.log(`Received ${projects_data.length} projects to sync`);
    console.log('Sample project data structure:', JSON.stringify(projects_data[0], null, 2));

    const stats: SyncStats = {
      total_processed: 0,
      new_synced: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    // Process each project
    for (const projectData of projects_data as OdooProjectData[]) {
      try {
        stats.total_processed++;
        console.log(`\n--- Processing project: ${projectData.name} ---`);
        console.log('Project data:', JSON.stringify(projectData, null, 2));

        // Look up project type ID
        let projectTypeId = null;
        if (projectData.projectType) {
          console.log(`Looking up project type: ${projectData.projectType}`);
          const { data: projectTypeData, error: projectTypeError } = await supabase
            .from('project_types')
            .select('id')
            .ilike('name', projectData.projectType)
            .maybeSingle();

          if (projectTypeError) {
            console.error('Error looking up project type:', projectTypeError);
          } else if (projectTypeData) {
            projectTypeId = projectTypeData.id;
            console.log(`Found project type ID: ${projectTypeId}`);
          } else {
            console.log(`Project type not found: ${projectData.projectType}`);
          }
        }

        // Look up project manager ID
        let projectManagerId = null;
        if (projectData.projectManager?.email) {
          console.log(`Looking up project manager: ${projectData.projectManager.email}`);
          const { data: managerData, error: managerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', projectData.projectManager.email.toLowerCase().trim())
            .maybeSingle();

          if (managerError) {
            console.error('Error looking up project manager:', managerError);
          } else if (managerData) {
            projectManagerId = managerData.id;
            console.log(`Found project manager ID: ${projectManagerId}`);
          } else {
            console.log(`Project manager not found: ${projectData.projectManager.email}`);
          }
        }

        // Check if project already exists
        console.log(`Checking if project exists: ${projectData.name}`);
        const { data: existingProject, error: checkError } = await supabase
          .from('projects_management')
          .select('id, project_name, client_name, project_manager, budget, is_active, description, project_level, project_type')
          .eq('project_name', projectData.name)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing project:', checkError);
          stats.errors++;
          continue;
        }

        const projectUpdateData = {
          project_name: projectData.name,
          client_name: null, // Odoo doesn't provide client name in this structure
          project_manager: projectManagerId,
          budget: projectData.projectValue || null,
          is_active: projectData.active,
          description: projectData.description,
          project_level: projectData.projectLevel,
          project_type: projectTypeId
        };

        console.log('Prepared update data:', JSON.stringify(projectUpdateData, null, 2));

        if (existingProject) {
          // Check if update is needed
          const needsUpdate = (
            existingProject.project_manager !== projectManagerId ||
            existingProject.budget !== projectUpdateData.budget ||
            existingProject.is_active !== projectUpdateData.is_active ||
            existingProject.description !== projectUpdateData.description ||
            existingProject.project_level !== projectUpdateData.project_level ||
            existingProject.project_type !== projectTypeId
          );

          if (needsUpdate) {
            console.log(`Updating existing project: ${projectData.name}`);
            const { error: updateError } = await supabase
              .from('projects_management')
              .update(projectUpdateData)
              .eq('id', existingProject.id);

            if (updateError) {
              console.error('Error updating project:', updateError);
              stats.errors++;
            } else {
              console.log(`Successfully updated project: ${projectData.name}`);
              stats.updated++;
            }
          } else {
            console.log(`No changes needed for project: ${projectData.name}`);
            stats.skipped++;
          }
        } else {
          // Insert new project
          console.log(`Inserting new project: ${projectData.name}`);
          const { error: insertError } = await supabase
            .from('projects_management')
            .insert(projectUpdateData);

          if (insertError) {
            console.error('Error inserting project:', insertError);
            stats.errors++;
          } else {
            console.log(`Successfully inserted new project: ${projectData.name}`);
            stats.new_synced++;
          }
        }

      } catch (projectError) {
        console.error(`Error processing project ${projectData?.name || 'unknown'}:`, projectError);
        stats.errors++;
      }
    }

    console.log('\n=== SYNC COMPLETED ===');
    console.log('Final statistics:', JSON.stringify(stats, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: 'Projects sync completed',
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Bulk sync error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      stats: {
        total_processed: 0,
        new_synced: 0,
        updated: 0,
        skipped: 0,
        errors: 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
