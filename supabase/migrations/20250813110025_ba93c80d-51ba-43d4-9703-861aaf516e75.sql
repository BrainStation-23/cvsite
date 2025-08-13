
-- Fix the bulk sync function to resolve all ambiguous column references
CREATE OR REPLACE FUNCTION bulk_sync_odoo_employees(employees_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  employee_item jsonb;
  manager_id uuid;
  sbu_id uuid;
  existing_profiles_map jsonb := '{}';
  manager_email_map jsonb := '{}';
  sbu_name_map jsonb := '{}';
  sync_stats json;
  updated_count integer := 0;
  not_found_count integer := 0;
  error_count integer := 0;
  total_processed integer := 0;
  user_email text;
  user_first_name text;
  employee_id text;
  manager_email text;
  sbu_name text;
  not_found_employees jsonb := '[]';
  error_employees jsonb := '[]';
BEGIN
  -- Build lookup maps for performance
  
  -- Get existing profiles by employee_id map
  SELECT jsonb_object_agg(prof.employee_id, prof.id)
  INTO existing_profiles_map
  FROM profiles prof
  WHERE prof.employee_id IS NOT NULL;
  
  -- Get profiles by email map for manager lookup
  SELECT jsonb_object_agg(prof.email, prof.id)
  INTO manager_email_map
  FROM profiles prof
  WHERE prof.email IS NOT NULL;
  
  -- Get SBUs by name map
  SELECT jsonb_object_agg(sbu.name, sbu.id)
  INTO sbu_name_map
  FROM sbus sbu;
  
  -- Process each employee
  FOR employee_item IN SELECT * FROM jsonb_array_elements(employees_data)
  LOOP
    total_processed := total_processed + 1;
    
    -- Extract employee data
    employee_id := employee_item->>'employeeId';
    user_email := employee_item->>'email';
    user_first_name := employee_item->>'name';
    manager_email := employee_item->>'managerEmail';
    sbu_name := employee_item->>'sbuName';
    
    -- Skip if no employee_id (required field)
    IF employee_id IS NULL OR trim(employee_id) = '' THEN
      error_count := error_count + 1;
      error_employees := error_employees || jsonb_build_object(
        'employeeId', employee_id,
        'reason', 'Missing employee ID'
      );
      CONTINUE;
    END IF;
    
    -- Check if profile exists by employee_id
    IF existing_profiles_map ? employee_id THEN
      -- Lookup manager UUID by email
      manager_id := NULL;
      IF manager_email IS NOT NULL AND trim(manager_email) != '' THEN
        manager_id := (manager_email_map->>manager_email)::uuid;
      END IF;
      
      -- Lookup SBU UUID by name
      sbu_id := NULL;
      IF sbu_name IS NOT NULL AND trim(sbu_name) != '' THEN
        sbu_id := (sbu_name_map->>sbu_name)::uuid;
      END IF;
      
      -- Update existing profile with explicit table alias and column references
      BEGIN
        UPDATE profiles prof
        SET 
          email = COALESCE(user_email, prof.email),
          first_name = COALESCE(user_first_name, prof.first_name),
          manager = manager_id,
          sbu_id = sbu_id,
          updated_at = now()
        WHERE prof.employee_id = employee_item->>'employeeId';
        
        updated_count := updated_count + 1;
      EXCEPTION
        WHEN OTHERS THEN
          error_count := error_count + 1;
          error_employees := error_employees || jsonb_build_object(
            'employeeId', employee_id,
            'reason', SQLERRM
          );
      END;
    ELSE
      -- Employee not found in database
      not_found_count := not_found_count + 1;
      not_found_employees := not_found_employees || jsonb_build_object(
        'employeeId', employee_id,
        'name', user_first_name,
        'email', user_email,
        'sbuName', sbu_name
      );
    END IF;
  END LOOP;
  
  -- Return statistics with not found employees
  sync_stats := json_build_object(
    'success', true,
    'message', 'Bulk employee sync completed',
    'stats', json_build_object(
      'total_processed', total_processed,
      'updated', updated_count,
      'not_found', not_found_count,
      'errors', error_count
    ),
    'not_found_employees', not_found_employees,
    'error_employees', error_employees
  );
  
  RETURN sync_stats;
END;
$$;
