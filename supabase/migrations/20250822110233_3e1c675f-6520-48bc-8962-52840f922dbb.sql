
-- Add missing columns to projects_management table
ALTER TABLE projects_management 
ADD COLUMN IF NOT EXISTS odoo_project_id text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS company_id integer DEFAULT 0;

-- Create index on odoo_project_id for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_projects_management_odoo_id 
ON projects_management(odoo_project_id);

-- Update the bulk_sync_odoo_projects function to handle new fields
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
    
    -- Look up manager ID if manager email is provided
    manager_id := NULL;
    IF project_record->>'managerEmail' IS NOT NULL AND project_record->>'managerEmail' != '' THEN
      SELECT id INTO manager_id 
      FROM profiles 
      WHERE email ILIKE project_record->>'managerEmail'
      LIMIT 1;
    END IF;
    
    -- Check if project already exists by odoo_project_id or name
    SELECT * INTO existing_project 
    FROM projects_management 
    WHERE odoo_project_id = project_record->>'id'
       OR (odoo_project_id IS NULL AND project_name = project_record->>'name')
    LIMIT 1;
    
    IF existing_project.id IS NOT NULL THEN
      -- Update existing project
      UPDATE projects_management 
      SET 
        project_name = project_record->>'name',
        description = project_record->>'description',
        company_id = COALESCE((project_record->>'companyId')::integer, 0),
        project_level = project_record->>'projectLevel',
        project_type = project_type_id,
        budget = COALESCE((project_record->>'projectValue')::numeric, budget),
        is_active = COALESCE((project_record->>'active')::boolean, true),
        project_manager = COALESCE(manager_id, project_manager),
        odoo_project_id = project_record->>'id',
        updated_at = now()
      WHERE id = existing_project.id;
      
      updated_count := updated_count + 1;
    ELSE
      -- Insert new project
      INSERT INTO projects_management (
        odoo_project_id,
        project_name,
        description,
        company_id,
        project_level,
        project_type,
        budget,
        is_active,
        project_manager
      ) VALUES (
        project_record->>'id',
        project_record->>'name',
        project_record->>'description',
        COALESCE((project_record->>'companyId')::integer, 0),
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
    'stats', jsonb_build_object(
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
      'new_synced', new_count,
      'updated', updated_count,
      'skipped', skipped_count
    )
  );
END;
$$;
