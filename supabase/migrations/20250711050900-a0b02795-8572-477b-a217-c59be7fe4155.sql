
CREATE OR REPLACE FUNCTION public.import_profile_json(profile_data json, target_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  user_profile_id uuid;
  total_imported integer := 0;
  general_info_success boolean := false;
  technical_skills_count integer := 0;
  specialized_skills_count integer := 0;
  experiences_count integer := 0;
  education_count integer := 0;
  trainings_count integer := 0;
  achievements_count integer := 0;
  projects_count integer := 0;
  
  -- Helper function to validate designation
  validated_designation text;
BEGIN
  -- Determine which profile to update
  user_profile_id := COALESCE(target_user_id, auth.uid());
  
  IF user_profile_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No user profile found'
    );
  END IF;

  -- Helper function to validate designation exists
  CREATE OR REPLACE FUNCTION validate_designation_helper(designation_name text)
  RETURNS text
  LANGUAGE plpgsql
  AS $helper$
  DECLARE
    valid_designation text;
  BEGIN
    IF designation_name IS NULL OR trim(designation_name) = '' THEN
      RETURN NULL;
    END IF;
    
    SELECT name INTO valid_designation
    FROM designations
    WHERE name ILIKE trim(designation_name)
    LIMIT 1;
    
    RETURN valid_designation;
  END;
  $helper$;

  -- Process General Information
  IF profile_data->'generalInfo' IS NOT NULL THEN
    BEGIN
      -- Validate current designation
      validated_designation := validate_designation_helper(profile_data->'generalInfo'->>'current_designation');
      
      INSERT INTO general_information (
        profile_id,
        first_name,
        last_name,
        biography,
        profile_image,
        current_designation
      ) VALUES (
        user_profile_id,
        profile_data->'generalInfo'->>'firstName',
        profile_data->'generalInfo'->>'lastName',
        profile_data->'generalInfo'->>'biography',
        profile_data->'generalInfo'->>'profileImage',
        validated_designation
      )
      ON CONFLICT (profile_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        biography = EXCLUDED.biography,
        profile_image = EXCLUDED.profile_image,
        current_designation = EXCLUDED.current_designation,
        updated_at = now();
      
      general_info_success := true;
      total_imported := total_imported + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to import general info: %', SQLERRM;
    END;
  END IF;

  -- Process Technical Skills
  IF profile_data->'technicalSkills' IS NOT NULL THEN
    -- Delete existing technical skills for this profile
    DELETE FROM technical_skills WHERE profile_id = user_profile_id;
    
    -- Insert new technical skills
    INSERT INTO technical_skills (profile_id, name, proficiency, priority)
    SELECT 
      user_profile_id,
      skill->>'name',
      COALESCE((skill->>'proficiency')::integer, 1),
      COALESCE((skill->>'priority')::integer, 0)
    FROM json_array_elements(profile_data->'technicalSkills') AS skill
    WHERE skill->>'name' IS NOT NULL AND trim(skill->>'name') != '';
    
    GET DIAGNOSTICS technical_skills_count = ROW_COUNT;
    total_imported := total_imported + technical_skills_count;
  END IF;

  -- Process Specialized Skills
  IF profile_data->'specializedSkills' IS NOT NULL THEN
    -- Delete existing specialized skills for this profile
    DELETE FROM specialized_skills WHERE profile_id = user_profile_id;
    
    -- Insert new specialized skills
    INSERT INTO specialized_skills (profile_id, name, proficiency, priority)
    SELECT 
      user_profile_id,
      skill->>'name',
      COALESCE((skill->>'proficiency')::integer, 1),
      COALESCE((skill->>'priority')::integer, 0)
    FROM json_array_elements(profile_data->'specializedSkills') AS skill
    WHERE skill->>'name' IS NOT NULL AND trim(skill->>'name') != '';
    
    GET DIAGNOSTICS specialized_skills_count = ROW_COUNT;
    total_imported := total_imported + specialized_skills_count;
  END IF;

  -- Process Experiences with designation validation
  IF profile_data->'experiences' IS NOT NULL THEN
    -- Delete existing experiences for this profile
    DELETE FROM experiences WHERE profile_id = user_profile_id;
    
    -- Insert new experiences with validated designations
    INSERT INTO experiences (
      profile_id, 
      company_name, 
      designation, 
      description, 
      start_date, 
      end_date, 
      is_current
    )
    SELECT 
      user_profile_id,
      exp->>'companyName',
      validate_designation_helper(exp->>'designation'), -- Validate designation here
      exp->>'description',
      COALESCE((exp->>'startDate')::date, CURRENT_DATE),
      CASE WHEN exp->>'endDate' != '' THEN (exp->>'endDate')::date ELSE NULL END,
      COALESCE((exp->>'isCurrent')::boolean, false)
    FROM json_array_elements(profile_data->'experiences') AS exp
    WHERE exp->>'companyName' IS NOT NULL AND trim(exp->>'companyName') != '';
    
    GET DIAGNOSTICS experiences_count = ROW_COUNT;
    total_imported := total_imported + experiences_count;
  END IF;

  -- Process Education
  IF profile_data->'education' IS NOT NULL THEN
    -- Delete existing education for this profile
    DELETE FROM education WHERE profile_id = user_profile_id;
    
    -- Insert new education
    INSERT INTO education (
      profile_id, 
      university, 
      degree, 
      department, 
      gpa, 
      start_date, 
      end_date, 
      is_current
    )
    SELECT 
      user_profile_id,
      edu->>'university',
      edu->>'degree',
      edu->>'department',
      edu->>'gpa',
      COALESCE((edu->>'startDate')::date, CURRENT_DATE),
      CASE WHEN edu->>'endDate' != '' THEN (edu->>'endDate')::date ELSE NULL END,
      COALESCE((edu->>'isCurrent')::boolean, false)
    FROM json_array_elements(profile_data->'education') AS edu
    WHERE edu->>'university' IS NOT NULL AND trim(edu->>'university') != '';
    
    GET DIAGNOSTICS education_count = ROW_COUNT;
    total_imported := total_imported + education_count;
  END IF;

  -- Process Trainings
  IF profile_data->'trainings' IS NOT NULL THEN
    -- Delete existing trainings for this profile
    DELETE FROM trainings WHERE profile_id = user_profile_id;
    
    -- Insert new trainings
    INSERT INTO trainings (
      profile_id, 
      title, 
      provider, 
      description, 
      certification_date, 
      certificate_url
    )
    SELECT 
      user_profile_id,
      training->>'title',
      COALESCE(training->>'provider', ''),
      training->>'description',
      COALESCE((training->>'date')::date, CURRENT_DATE),
      training->>'certificateUrl'
    FROM json_array_elements(profile_data->'trainings') AS training
    WHERE training->>'title' IS NOT NULL AND trim(training->>'title') != '';
    
    GET DIAGNOSTICS trainings_count = ROW_COUNT;
    total_imported := total_imported + trainings_count;
  END IF;

  -- Process Achievements
  IF profile_data->'achievements' IS NOT NULL THEN
    -- Delete existing achievements for this profile
    DELETE FROM achievements WHERE profile_id = user_profile_id;
    
    -- Insert new achievements
    INSERT INTO achievements (profile_id, title, description, date)
    SELECT 
      user_profile_id,
      achievement->>'title',
      achievement->>'description',
      COALESCE((achievement->>'date')::date, CURRENT_DATE)
    FROM json_array_elements(profile_data->'achievements') AS achievement
    WHERE achievement->>'title' IS NOT NULL AND trim(achievement->>'title') != '';
    
    GET DIAGNOSTICS achievements_count = ROW_COUNT;
    total_imported := total_imported + achievements_count;
  END IF;

  -- Process Projects
  IF profile_data->'projects' IS NOT NULL THEN
    -- Delete existing projects for this profile
    DELETE FROM projects WHERE profile_id = user_profile_id;
    
    -- Insert new projects
    INSERT INTO projects (
      profile_id, 
      name, 
      role, 
      description, 
      responsibility, 
      start_date, 
      end_date, 
      is_current, 
      technologies_used, 
      url
    )
    SELECT 
      user_profile_id,
      project->>'name',
      COALESCE(project->>'role', ''),
      project->>'description',
      project->>'responsibility',
      COALESCE((project->>'startDate')::date, CURRENT_DATE),
      CASE WHEN project->>'endDate' != '' THEN (project->>'endDate')::date ELSE NULL END,
      COALESCE((project->>'isCurrent')::boolean, false),
      CASE 
        WHEN project->'technologiesUsed' IS NOT NULL THEN 
          ARRAY(SELECT json_array_elements_text(project->'technologiesUsed'))
        ELSE NULL 
      END,
      project->>'url'
    FROM json_array_elements(profile_data->'projects') AS project
    WHERE project->>'name' IS NOT NULL AND trim(project->>'name') != '';
    
    GET DIAGNOSTICS projects_count = ROW_COUNT;
    total_imported := total_imported + projects_count;
  END IF;

  -- Drop the helper function
  DROP FUNCTION validate_designation_helper(text);

  -- Build result
  result_data := json_build_object(
    'success', true,
    'totalImported', total_imported,
    'generalInfo', general_info_success,
    'technicalSkills', technical_skills_count,
    'specializedSkills', specialized_skills_count,
    'experiences', experiences_count,
    'education', education_count,
    'trainings', trainings_count,
    'achievements', achievements_count,
    'projects', projects_count
  );
  
  RETURN result_data;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
