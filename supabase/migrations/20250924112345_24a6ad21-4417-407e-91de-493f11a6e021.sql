-- Fix security warning for bulk_update_users function by setting search_path
CREATE OR REPLACE FUNCTION public.bulk_update_users(users_data jsonb)
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
  current_custom_role record;
  current_sbu_context_id uuid;
  parsed_date_of_joining date;
  parsed_career_start_date date;
  parsed_date_of_birth date;
  parsed_resignation_date date;
  parsed_exit_date date;
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
      current_custom_role := NULL;
      current_sbu_context_id := NULL;
      
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
      
      -- Custom role lookup (prefer ID over name)
      IF user_record->>'customRoleId' IS NOT NULL AND trim(user_record->>'customRoleId') != '' THEN
        SELECT id, name, is_sbu_bound INTO current_custom_role
        FROM custom_roles 
        WHERE id = (trim(user_record->>'customRoleId'))::uuid 
          AND is_active = true
        LIMIT 1;
      ELSIF user_record->>'customRoleName' IS NOT NULL AND trim(user_record->>'customRoleName') != '' THEN
        SELECT id, name, is_sbu_bound INTO current_custom_role
        FROM custom_roles 
        WHERE name ILIKE trim(user_record->>'customRoleName')
          AND is_active = true
        LIMIT 1;
      END IF;
      
      -- SBU context lookup for SBU-bound roles
      IF current_custom_role.is_sbu_bound THEN
        IF user_record->>'sbuContextId' IS NOT NULL AND trim(user_record->>'sbuContextId') != '' THEN
          current_sbu_context_id := (trim(user_record->>'sbuContextId'))::uuid;
        ELSIF user_record->>'sbuContextName' IS NOT NULL AND trim(user_record->>'sbuContextName') != '' THEN
          SELECT id INTO current_sbu_context_id
          FROM sbus 
          WHERE name ILIKE trim(user_record->>'sbuContextName')
          LIMIT 1;
        END IF;
        
        -- Validate SBU context is provided for SBU-bound roles
        IF current_sbu_context_id IS NULL THEN
          failed_users := failed_users || jsonb_build_object(
            'userId', current_user_id,
            'error', 'SBU-bound role requires SBU context, but none was provided or found'
          );
          error_count := error_count + 1;
          CONTINUE;
        END IF;
      END IF;
      
      -- Parse dates with validation
      parsed_date_of_joining := NULL;
      parsed_career_start_date := NULL;
      parsed_date_of_birth := NULL;
      parsed_resignation_date := NULL;
      parsed_exit_date := NULL;
      
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
      
      IF user_record->>'dateOfBirth' IS NOT NULL AND trim(user_record->>'dateOfBirth') != '' THEN
        BEGIN
          parsed_date_of_birth := (trim(user_record->>'dateOfBirth'))::date;
        EXCEPTION
          WHEN OTHERS THEN
            parsed_date_of_birth := NULL;
        END;
      END IF;
      
      IF user_record->>'resignationDate' IS NOT NULL AND trim(user_record->>'resignationDate') != '' THEN
        BEGIN
          parsed_resignation_date := (trim(user_record->>'resignationDate'))::date;
        EXCEPTION
          WHEN OTHERS THEN
            parsed_resignation_date := NULL;
        END;
      END IF;
      
      IF user_record->>'exitDate' IS NOT NULL AND trim(user_record->>'exitDate') != '' THEN
        BEGIN
          parsed_exit_date := (trim(user_record->>'exitDate'))::date;
        EXCEPTION
          WHEN OTHERS THEN
            parsed_exit_date := NULL;
        END;
      END IF;
      
      -- Update profiles table
      UPDATE profiles 
      SET 
        first_name = COALESCE(NULLIF(trim(user_record->>'firstName'), ''), first_name),
        last_name = COALESCE(NULLIF(trim(user_record->>'lastName'), ''), last_name),
        employee_id = COALESCE(NULLIF(trim(user_record->>'employeeId'), ''), employee_id),
        sbu_id = COALESCE(current_sbu_id, sbu_id),
        expertise = COALESCE(current_expertise_id, expertise),
        resource_type = COALESCE(current_resource_type_id, resource_type),
        manager = COALESCE(current_manager_id, manager),
        date_of_joining = COALESCE(parsed_date_of_joining, date_of_joining),
        career_start_date = COALESCE(parsed_career_start_date, career_start_date),
        date_of_birth = COALESCE(parsed_date_of_birth, date_of_birth),
        resignation_date = COALESCE(parsed_resignation_date, resignation_date),
        exit_date = COALESCE(parsed_exit_date, exit_date),
        active = COALESCE(
          CASE 
            WHEN user_record->>'active' IS NOT NULL AND trim(user_record->>'active') != '' 
            THEN (trim(user_record->>'active'))::boolean 
            ELSE NULL 
          END, 
          active
        ),
        has_overhead = COALESCE(
          CASE 
            WHEN user_record->>'hasOverhead' IS NOT NULL AND trim(user_record->>'hasOverhead') != '' 
            THEN (trim(user_record->>'hasOverhead'))::boolean 
            ELSE NULL 
          END, 
          has_overhead
        ),
        updated_at = now()
      WHERE id = current_user_id;
      
      -- Assign custom role if provided
      IF current_custom_role.id IS NOT NULL THEN
        BEGIN
          PERFORM public.assign_custom_role_to_user(
            current_user_id,
            current_custom_role.id,
            current_sbu_context_id,
            NULL -- Let the function use auth.uid() as fallback
          );
        EXCEPTION
          WHEN OTHERS THEN
            -- Log the error but don't fail the entire operation
            RAISE WARNING 'Failed to assign custom role % to user %: %', current_custom_role.name, current_user_id, SQLERRM;
        END;
      END IF;
      
      -- Add to successful updates
      success_users := success_users || jsonb_build_object(
        'userId', current_user_id,
        'firstName', COALESCE(NULLIF(trim(user_record->>'firstName'), ''), (SELECT first_name FROM profiles WHERE id = current_user_id)),
        'lastName', COALESCE(NULLIF(trim(user_record->>'lastName'), ''), (SELECT last_name FROM profiles WHERE id = current_user_id)),
        'customRoleAssigned', current_custom_role.id IS NOT NULL,
        'customRoleName', current_custom_role.name,
        'sbuContextAssigned', current_sbu_context_id IS NOT NULL,
        'sbuAssigned', current_sbu_id IS NOT NULL,
        'expertiseAssigned', current_expertise_id IS NOT NULL,
        'resourceTypeAssigned', current_resource_type_id IS NOT NULL,
        'managerAssigned', current_manager_id IS NOT NULL
      );
      
      success_count := success_count + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Add to failed updates
        failed_users := failed_users || jsonb_build_object(
          'userId', current_user_id,
          'error', SQLERRM
        );
        error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Return comprehensive results
  SELECT json_build_object(
    'message', format('Processed %s users. %s successful, %s failed.', 
                     success_count + error_count, success_count, error_count),
    'results', json_build_object(
      'successful', success_users,
      'failed', failed_users
    ),
    'chunkInfo', json_build_object(
      'totalUsers', success_count + error_count,
      'totalBatches', 1,
      'batchSize', success_count + error_count
    )
  ) INTO result_json;
  
  RETURN result_json;
END;
$$;