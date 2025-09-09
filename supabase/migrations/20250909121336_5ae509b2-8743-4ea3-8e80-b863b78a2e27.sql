-- Fix security warning by adding SET search_path = public to the function
CREATE OR REPLACE FUNCTION bulk_update_users(users_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record jsonb;
  success_count int := 0;
  error_count int := 0;
  success_users jsonb := '[]'::jsonb;
  failed_users jsonb := '[]'::jsonb;
  current_user_id uuid;
  current_sbu_id uuid;
  current_expertise_id uuid;
  current_resource_type_id uuid;
  current_manager_id uuid;
  parsed_date_of_joining date;
  parsed_career_start_date date;
  result_json json;
BEGIN
  -- Process each user in the input data
  FOR user_record IN SELECT * FROM jsonb_array_elements(users_data)
  LOOP
    BEGIN
      -- Extract user_id
      current_user_id := (user_record->>'userId')::uuid;
      
      -- Validate that user exists in profiles table
      IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id) THEN
        failed_users := failed_users || jsonb_build_object(
          'userId', current_user_id,
          'error', 'User profile not found'
        );
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Lookup foreign key values using efficient queries
      current_sbu_id := NULL;
      current_expertise_id := NULL;
      current_resource_type_id := NULL;
      current_manager_id := NULL;
      
      -- SBU lookup
      IF user_record->>'sbuName' IS NOT NULL AND trim(user_record->>'sbuName') != '' THEN
        SELECT id INTO current_sbu_id 
        FROM sbus 
        WHERE name ILIKE trim(user_record->>'sbuName')
        LIMIT 1;
      END IF;
      
      -- Expertise lookup
      IF user_record->>'expertiseName' IS NOT NULL AND trim(user_record->>'expertiseName') != '' THEN
        SELECT id INTO current_expertise_id 
        FROM expertise_types 
        WHERE name ILIKE trim(user_record->>'expertiseName')
        LIMIT 1;
      END IF;
      
      -- Resource type lookup
      IF user_record->>'resourceTypeName' IS NOT NULL AND trim(user_record->>'resourceTypeName') != '' THEN
        SELECT id INTO current_resource_type_id 
        FROM resource_types 
        WHERE name ILIKE trim(user_record->>'resourceTypeName')
        LIMIT 1;
      END IF;
      
      -- Manager lookup
      IF user_record->>'managerEmail' IS NOT NULL AND trim(user_record->>'managerEmail') != '' THEN
        SELECT id INTO current_manager_id 
        FROM profiles 
        WHERE email = trim(user_record->>'managerEmail')
        LIMIT 1;
      END IF;
      
      -- Parse dates with validation
      parsed_date_of_joining := NULL;
      parsed_career_start_date := NULL;
      
      IF user_record->>'dateOfJoining' IS NOT NULL AND trim(user_record->>'dateOfJoining') != '' THEN
        BEGIN
          parsed_date_of_joining := (trim(user_record->>'dateOfJoining'))::date;
        EXCEPTION
          WHEN OTHERS THEN
            parsed_date_of_joining := NULL;
        END;
      END IF;
      
      IF user_record->>'careerStartDate' IS NOT NULL AND trim(user_record->>'careerStartDate') != '' THEN
        BEGIN
          parsed_career_start_date := (trim(user_record->>'careerStartDate'))::date;
        EXCEPTION
          WHEN OTHERS THEN
            parsed_career_start_date := NULL;
        END;
      END IF;
      
      -- Update profiles table
      UPDATE profiles 
      SET 
        first_name = COALESCE(NULLIF(trim(user_record->>'firstName'), ''), first_name),
        last_name = CASE 
          WHEN user_record->>'lastName' IS NOT NULL THEN NULLIF(trim(user_record->>'lastName'), '')
          ELSE last_name 
        END,
        employee_id = COALESCE(NULLIF(trim(user_record->>'employeeId'), ''), employee_id),
        sbu_id = COALESCE(current_sbu_id, sbu_id),
        expertise = COALESCE(current_expertise_id, expertise),
        resource_type = COALESCE(current_resource_type_id, resource_type),
        manager = COALESCE(current_manager_id, manager),
        date_of_joining = COALESCE(parsed_date_of_joining, date_of_joining),
        career_start_date = COALESCE(parsed_career_start_date, career_start_date),
        updated_at = now()
      WHERE id = current_user_id;
      
      -- Handle role updates
      IF user_record->>'role' IS NOT NULL AND trim(user_record->>'role') != '' THEN
        DECLARE
          target_role text := lower(trim(user_record->>'role'));
        BEGIN
          -- Validate role
          IF target_role NOT IN ('admin', 'manager', 'employee') THEN
            failed_users := failed_users || jsonb_build_object(
              'userId', current_user_id,
              'error', 'Invalid role: ' || target_role || '. Must be admin, manager, or employee'
            );
            error_count := error_count + 1;
            CONTINUE;
          END IF;
          
          -- Update or insert role
          INSERT INTO user_roles (user_id, role)
          VALUES (current_user_id, target_role)
          ON CONFLICT (user_id, role) DO NOTHING;
          
          -- Remove other roles for this user (ensure single role per user)
          DELETE FROM user_roles 
          WHERE user_id = current_user_id 
            AND role != target_role;
        END;
      END IF;
      
      -- Add to success list
      success_users := success_users || jsonb_build_object(
        'userId', current_user_id,
        'success', true
      );
      success_count := success_count + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        failed_users := failed_users || jsonb_build_object(
          'userId', COALESCE(current_user_id::text, user_record->>'userId'),
          'error', SQLERRM
        );
        error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Build result
  result_json := json_build_object(
    'success', true,
    'totalProcessed', success_count + error_count,
    'successCount', success_count,
    'errorCount', error_count,
    'results', json_build_object(
      'successful', success_users::json,
      'failed', failed_users::json
    ),
    'message', format('Processed %s users. %s successful, %s failed.', 
                     success_count + error_count, success_count, error_count)
  );
  
  RETURN result_json;
END;
$$;