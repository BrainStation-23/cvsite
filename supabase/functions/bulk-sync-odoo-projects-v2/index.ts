
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OdooProjectData {
  name: string;
  description: string | null;
  projectLevel: string | null;
  projectType: string;
  projectValue: number;
  active: boolean;
  projectManager: {
    name: string;
    email: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projects_data } = await req.json();
    
    if (!Array.isArray(projects_data)) {
      throw new Error('projects_data must be an array');
    }

    console.log(`Processing ${projects_data.length} projects from Odoo`);

    let newSynced = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process projects in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < projects_data.length; i += batchSize) {
      const batch = projects_data.slice(i, i + batchSize);
      
      for (const project of batch) {
        try {
          // Log the project data for debugging
          console.log(`Processing project: ${project.name}`, {
            projectManager: project.projectManager,
            projectLevel: project.projectLevel,
            projectType: project.projectType
          });

          // Extract project manager email (use email directly instead of trying to map by name)
          const projectManagerEmail = project.projectManager?.email || null;
          
          // Check if project already exists
          const { data: existingProject, error: selectError } = await supabase
            .from('projects_management')
            .select('id, project_name, updated_at')
            .eq('project_name', project.name)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error(`Error checking existing project ${project.name}:`, selectError);
            errors++;
            continue;
          }

          const projectData = {
            project_name: project.name,
            description: project.description,
            project_level: project.projectLevel, // Set as plain text
            project_type: project.projectType,
            budget: project.projectValue || null,
            is_active: project.active,
            project_manager: projectManagerEmail, // Use email directly
            client_name: null, // Not provided by Odoo, keeping null
            updated_at: new Date().toISOString()
          };

          if (existingProject) {
            // Update existing project
            const { error: updateError } = await supabase
              .from('projects_management')
              .update(projectData)
              .eq('id', existingProject.id);

            if (updateError) {
              console.error(`Error updating project ${project.name}:`, updateError);
              errors++;
            } else {
              console.log(`Updated project: ${project.name}`);
              updated++;
            }
          } else {
            // Insert new project
            const { error: insertError } = await supabase
              .from('projects_management')
              .insert({
                ...projectData,
                created_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error inserting project ${project.name}:`, insertError);
              errors++;
            } else {
              console.log(`Inserted new project: ${project.name}`);
              newSynced++;
            }
          }
        } catch (projectError) {
          console.error(`Error processing project ${project.name}:`, projectError);
          errors++;
        }
      }
    }

    const stats = {
      total_processed: projects_data.length,
      new_synced: newSynced,
      updated: updated,
      skipped: skipped,
      errors: errors
    };

    console.log('Bulk sync completed with stats:', stats);

    return new Response(JSON.stringify({
      success: true,
      message: 'Bulk sync completed',
      stats: stats
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
