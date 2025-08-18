
-- Update the bulk_sync_odoo_employees function to handle new date fields
CREATE OR REPLACE FUNCTION bulk_sync_odoo_employees(employees_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    employee_record jsonb;
    processed_count integer := 0;
    updated_count integer := 0;
    not_found_count integer := 0;
    error_count integer := 0;
    not_found_employees jsonb[] := ARRAY[]::jsonb[];
    error_employees jsonb[] := ARRAY[]::jsonb[];
    parsed_joining_date date;
    parsed_career_start_date date;
    parsed_birth_date date;
BEGIN
    -- Process each employee in the JSON array
    FOR employee_record IN SELECT * FROM jsonb_array_elements(employees_data)
    LOOP
        BEGIN
            processed_count := processed_count + 1;
            
            -- Parse and validate date fields
            parsed_joining_date := NULL;
            parsed_career_start_date := NULL;
            parsed_birth_date := NULL;
            
            -- Parse joining date
            IF employee_record->>'joiningDate' IS NOT NULL AND employee_record->>'joiningDate' != '' THEN
                BEGIN
                    parsed_joining_date := (employee_record->>'joiningDate')::date;
                    -- Skip placeholder dates
                    IF parsed_joining_date = '1900-01-01' THEN
                        parsed_joining_date := NULL;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    parsed_joining_date := NULL;
                END;
            END IF;
            
            -- Parse career start date
            IF employee_record->>'careerStartDate' IS NOT NULL AND employee_record->>'careerStartDate' != '' THEN
                BEGIN
                    parsed_career_start_date := (employee_record->>'careerStartDate')::date;
                    -- Skip placeholder dates
                    IF parsed_career_start_date = '1900-01-01' THEN
                        parsed_career_start_date := NULL;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    parsed_career_start_date := NULL;
                END;
            END IF;
            
            -- Parse date of birth
            IF employee_record->>'dateOfBirth' IS NOT NULL AND employee_record->>'dateOfBirth' != '' THEN
                BEGIN
                    parsed_birth_date := (employee_record->>'dateOfBirth')::date;
                    -- Skip placeholder dates
                    IF parsed_birth_date = '1900-01-01' THEN
                        parsed_birth_date := NULL;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    parsed_birth_date := NULL;
                END;
            END IF;
            
            -- Try to update the profile
            UPDATE profiles 
            SET 
                email = employee_record->>'email',
                first_name = COALESCE(SPLIT_PART(employee_record->>'name', ' ', 1), first_name),
                last_name = COALESCE(NULLIF(TRIM(SUBSTRING(employee_record->>'name' FROM POSITION(' ' IN employee_record->>'name') + 1)), ''), last_name),
                date_of_joining = COALESCE(parsed_joining_date, date_of_joining),
                career_start_date = COALESCE(parsed_career_start_date, career_start_date),
                date_of_birth = COALESCE(parsed_birth_date, date_of_birth),
                updated_at = now()
            WHERE employee_id = employee_record->>'employeeId';
            
            IF FOUND THEN
                updated_count := updated_count + 1;
                
                -- Try to update manager relationship if manager email is provided
                IF employee_record->'managerEmail' IS NOT NULL AND employee_record->>'managerEmail' != '' THEN
                    UPDATE profiles 
                    SET manager = (
                        SELECT id FROM profiles 
                        WHERE email = employee_record->>'managerEmail' 
                        LIMIT 1
                    )
                    WHERE employee_id = employee_record->>'employeeId'
                    AND (
                        SELECT id FROM profiles 
                        WHERE email = employee_record->>'managerEmail' 
                        LIMIT 1
                    ) IS NOT NULL;
                END IF;
                
                -- Try to update SBU if provided
                IF employee_record->'sbuName' IS NOT NULL AND employee_record->>'sbuName' != '' THEN
                    UPDATE profiles 
                    SET sbu_id = (
                        SELECT id FROM sbus 
                        WHERE name = employee_record->>'sbuName' 
                        LIMIT 1
                    )
                    WHERE employee_id = employee_record->>'employeeId'
                    AND (
                        SELECT id FROM sbus 
                        WHERE name = employee_record->>'sbuName' 
                        LIMIT 1
                    ) IS NOT NULL;
                END IF;
            ELSE
                not_found_count := not_found_count + 1;
                not_found_employees := not_found_employees || jsonb_build_object(
                    'employeeId', employee_record->>'employeeId',
                    'name', employee_record->>'name',
                    'email', employee_record->>'email',
                    'sbuName', employee_record->>'sbuName'
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            error_employees := error_employees || jsonb_build_object(
                'employeeId', employee_record->>'employeeId',
                'reason', SQLERRM
            );
        END;
    END LOOP;
    
    -- Return summary statistics
    RETURN jsonb_build_object(
        'stats', jsonb_build_object(
            'total_processed', processed_count,
            'updated', updated_count,
            'not_found', not_found_count,
            'errors', error_count
        ),
        'not_found_employees', to_jsonb(not_found_employees),
        'error_employees', to_jsonb(error_employees)
    );
END;
$$;
