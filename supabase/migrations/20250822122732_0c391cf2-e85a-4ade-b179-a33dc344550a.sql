
CREATE OR REPLACE FUNCTION public.bulk_sync_odoo_projects(projects_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  project_record jsonb;
  project_manager_id uuid;
  project_type_id uuid;
  existing_project_id uuid;
  projects_inserted integer := 0;
  projects_updated integer := 0;
  projects_skipped integer := 0;
  error_projects jsonb := '[]'::jsonb;
  result json;
BEGIN
  -- Log the start of the sync process
  RAISE LOG 'Starting bulk sync of % projects', jsonb_array_length(projects_data);
  
  -- Process each project
  FOR project_record IN SELECT * FROM jsonb_array_elements(projects_data)
  LOOP
    BEGIN
      -- Log each project being processed
      RAISE LOG 'Processing project: %', project_record->>'projectName';
      
      -- Initialize variables
      project_manager_id := NULL;
      project_type_id := NULL;
      existing_project_id := NULL;
      
      -- Find project manager by email if provided
      IF project_record->>'managerEmail' IS NOT NULL AND project_record->>'managerEmail' != '' THEN
        SELECT p.id INTO project_manager_id
        FROM profiles p
        WHERE p.email = project_record->>'managerEmail'
        LIMIT 1;
        
        RAISE LOG 'Project manager lookup for email %: %', 
          project_record->>'managerEmail', 
          CASE WHEN project_manager_id IS NOT NULL THEN 'Found' ELSE 'Not found' END;
      END IF;
      
      -- Find project type by name if provided
      IF project_record->>'projectType' IS NOT NULL AND project_record->>'projectType' != '' THEN
        SELECT pt.id INTO project_type_id
        FROM project_types pt
        WHERE pt.name ILIKE project_record->>'projectType'
        LIMIT 1;
        
        RAISE LOG 'Project type lookup for %: %', 
          project_record->>'projectType', 
          CASE WHEN project_type_id IS NOT NULL THEN 'Found' ELSE 'Not found' END;
      END IF;
      
      -- Check if project already exists by name
      SELECT pm.id INTO existing_project_id
      FROM projects_management pm
      WHERE pm.project_name = project_record->>'projectName'
      LIMIT 1;
      
      IF existing_project_id IS NOT NULL THEN
        -- Update existing project
        UPDATE projects_management SET
          description = project_record->>'description',
          project_level = project_record->>'projectLevel',
          project_type = project_type_id,
          budget = CASE 
            WHEN project_record->>'projectValue' IS NOT NULL 
            THEN (project_record->>'projectValue')::numeric 
            ELSE NULL 
          END,
          is_active = COALESCE((project_record->>'active')::boolean, true),
          project_manager = project_manager_id,
          updated_at = now()
        WHERE id = existing_project_id;
        
        projects_updated := projects_updated + 1;
        RAISE LOG 'Updated project: %', project_record->>'projectName';
        
      ELSE
        -- Insert new project
        INSERT INTO projects_management (
          project_name,
          description,
          project_level,
          project_type,
          budget,
          is_active,
          project_manager,
          created_at,
          updated_at
        ) VALUES (
          project_record->>'projectName',
          project_record->>'description',
          project_record->>'projectLevel',
          project_type_id,
          CASE 
            WHEN project_record->>'projectValue' IS NOT NULL 
            THEN (project_record->>'projectValue')::numeric 
            ELSE NULL 
          END,
          COALESCE((project_record->>'active')::boolean, true),
          project_manager_id,
          now(),
          now()
        );
        
        projects_inserted := projects_inserted + 1;
        RAISE LOG 'Inserted new project: %', project_record->>'projectName';
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error and add to error list
        RAISE LOG 'Error processing project %: %', project_record->>'projectName', SQLERRM;
        error_projects := error_projects || jsonb_build_object(
          'projectName', project_record->>'projectName',
          'error', SQLERRM
        );
        projects_skipped := projects_skipped + 1;
    END;
  END LOOP;
  
  -- Build result
  result := json_build_object(
    'success', true,
    'stats', json_build_object(
      'inserted', projects_inserted,
      'updated', projects_updated,
      'skipped', projects_skipped,
      'total_processed', projects_inserted + projects_updated + projects_skipped
    ),
    'error_projects', error_projects
  );
  
  RAISE LOG 'Bulk sync completed - Inserted: %, Updated: %, Skipped: %', 
    projects_inserted, projects_updated, projects_skipped;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Fatal error in bulk_sync_odoo_projects: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'stats', json_build_object(
        'inserted', projects_inserted,
        'updated', projects_updated,
        'skipped', projects_skipped
      )
    );
END;
$function$;
