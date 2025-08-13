
-- Create a bulk sync RPC function for Odoo projects
CREATE OR REPLACE FUNCTION bulk_sync_odoo_projects(projects_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_item jsonb;
  project_manager_id uuid;
  project_type_id uuid;
  existing_projects_map jsonb := '{}';
  manager_email_map jsonb := '{}';
  project_type_map jsonb := '{}';
  sync_stats json;
  new_synced integer := 0;
  updated_count integer := 0;
  skipped_count integer := 0;
  total_processed integer := 0;
BEGIN
  -- Build lookup maps for performance
  
  -- Get existing projects map
  SELECT jsonb_object_agg(project_name, id)
  INTO existing_projects_map
  FROM projects_management;
  
  -- Get project managers by email map
  SELECT jsonb_object_agg(email, id)
  INTO manager_email_map
  FROM profiles
  WHERE email IS NOT NULL;
  
  -- Get project types by name map
  SELECT jsonb_object_agg(name, id)
  INTO project_type_map
  FROM project_types;
  
  -- Process each project
  FOR project_item IN SELECT * FROM jsonb_array_elements(projects_data)
  LOOP
    total_processed := total_processed + 1;
    
    -- Lookup project manager UUID by email
    project_manager_id := NULL;
    IF project_item->>'managerEmail' IS NOT NULL THEN
      project_manager_id := (manager_email_map->>>(project_item->>'managerEmail'))::uuid;
    END IF;
    
    -- Lookup project type UUID by name
    project_type_id := NULL;
    IF project_item->>'projectType' IS NOT NULL THEN
      project_type_id := (project_type_map->>>(project_item->>'projectType'))::uuid;
    END IF;
    
    -- Check if project exists
    IF existing_projects_map ? (project_item->>'name') THEN
      -- Update existing project
      UPDATE projects_management 
      SET 
        project_manager = project_manager_id,
        project_type = project_type_id,
        budget = COALESCE((project_item->>'projectValue')::numeric, budget),
        is_active = COALESCE((project_item->>'active')::boolean, is_active),
        updated_at = now()
      WHERE project_name = project_item->>'name';
      
      updated_count := updated_count + 1;
    ELSE
      -- Insert new project
      BEGIN
        INSERT INTO projects_management (
          project_name,
          client_name,
          project_manager,
          project_type,
          budget,
          is_active
        ) VALUES (
          project_item->>'name',
          NULL, -- Odoo doesn't provide client info
          project_manager_id,
          project_type_id,
          (project_item->>'projectValue')::numeric,
          COALESCE((project_item->>'active')::boolean, true)
        );
        
        new_synced := new_synced + 1;
      EXCEPTION
        WHEN OTHERS THEN
          -- Log error and continue
          skipped_count := skipped_count + 1;
          CONTINUE;
      END;
    END IF;
  END LOOP;
  
  -- Return statistics
  sync_stats := json_build_object(
    'success', true,
    'message', 'Bulk sync completed',
    'stats', json_build_object(
      'total_processed', total_processed,
      'new_synced', new_synced,
      'updated', updated_count,
      'skipped', skipped_count
    )
  );
  
  RETURN sync_stats;
END;
$$;
