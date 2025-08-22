
-- Phase 1: Database Schema Cleanup
-- Drop unnecessary columns and index
DROP INDEX IF EXISTS idx_projects_management_odoo_id;
ALTER TABLE projects_management 
DROP COLUMN IF EXISTS odoo_project_id,
DROP COLUMN IF EXISTS company_id;

-- Ensure description column exists (it should already be there)
ALTER TABLE projects_management 
ADD COLUMN IF NOT EXISTS description text;

-- Phase 2: Update RPC Function
CREATE OR REPLACE FUNCTION bulk_sync_odoo_projects(projects_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record jsonb;
  new_count integer := 0;
  updated_count integer := 0;
  skipped_count integer := 0;
  existing_project record;
  project_type_id uuid;
  manager_id uuid;
  manager_email text;
BEGIN
  -- Loop through each project in the input data
  FOR project_record IN SELECT * FROM jsonb_array_elements(projects_data)
  LOOP
    -- Look up project type ID if project type is provided
    project_type_id := NULL;
    IF project_record->>'projectType' IS NOT NULL AND project_record->>'projectType' != '' THEN
      SELECT id INTO project_type_id 
      FROM project_types 
      WHERE name ILIKE project_record->>'projectType'
      LIMIT 1;
    END IF;
    
    -- Extract manager email from nested projectManager object
    manager_id := NULL;
    manager_email := project_record->'projectManager'->>'email';
    IF manager_email IS NOT NULL AND manager_email != '' THEN
      SELECT id INTO manager_id 
      FROM profiles 
      WHERE email ILIKE manager_email
      LIMIT 1;
    END IF;
    
    -- Check if project already exists by name (since we don't have odoo_project_id anymore)
    SELECT * INTO existing_project 
    FROM projects_management 
    WHERE project_name = project_record->>'name'
    LIMIT 1;
    
    IF existing_project.id IS NOT NULL THEN
      -- Update existing project
      UPDATE projects_management 
      SET 
        project_name = project_record->>'name',
        description = project_record->>'description',
        project_level = project_record->>'projectLevel',
        project_type = project_type_id,
        budget = COALESCE((project_record->>'projectValue')::numeric, budget),
        is_active = COALESCE((project_record->>'active')::boolean, true),
        project_manager = COALESCE(manager_id, project_manager),
        updated_at = now()
      WHERE id = existing_project.id;
      
      updated_count := updated_count + 1;
    ELSE
      -- Insert new project
      INSERT INTO projects_management (
        project_name,
        description,
        project_level,
        project_type,
        budget,
        is_active,
        project_manager
      ) VALUES (
        project_record->>'name',
        project_record->>'description',
        project_record->>'projectLevel',
        project_type_id,
        COALESCE((project_record->>'projectValue')::numeric, NULL),
        COALESCE((project_record->>'active')::boolean, true),
        manager_id
      );
      
      new_count := new_count + 1;
    END IF;
  END LOOP;
  
  -- Return statistics
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bulk sync completed',
    'stats', jsonb_build_object(
      'total_processed', new_count + updated_count,
      'new_synced', new_count,
      'updated', updated_count,
      'skipped', skipped_count
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'stats', jsonb_build_object(
      'total_processed', new_count + updated_count,
      'new_synced', new_count,
      'updated', updated_count,
      'skipped', skipped_count
    )
  );
END;
$$;
