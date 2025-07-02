
-- Create RPC function to export user profile data as JSON
CREATE OR REPLACE FUNCTION public.export_profile_json(target_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_json json;
  target_profile_id uuid;
BEGIN
  -- If no target_user_id provided, use the authenticated user
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Check if user has permission (admin/manager can export any profile, users can only export their own)
  IF target_user_id != auth.uid() AND NOT (
    SELECT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to export this profile';
  END IF;
  
  -- Get the profile ID from user ID
  SELECT id INTO target_profile_id 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF target_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  -- Build comprehensive JSON export
  SELECT json_build_object(
    'generalInfo', json_build_object(
      'firstName', COALESCE(gi.first_name, p.first_name),
      'lastName', COALESCE(gi.last_name, p.last_name),
      'biography', gi.biography,
      'profileImage', gi.profile_image,
      'current_designation', gi.current_designation
    ),
    'technicalSkills', COALESCE((
      SELECT json_agg(json_build_object(
        'name', ts.name,
        'proficiency', ts.proficiency
      ) ORDER BY ts.priority ASC, ts.name ASC)
      FROM technical_skills ts
      WHERE ts.profile_id = target_profile_id
    ), '[]'::json),
    'specializedSkills', COALESCE((
      SELECT json_agg(json_build_object(
        'name', ss.name,
        'proficiency', ss.proficiency
      ) ORDER BY ss.name ASC)
      FROM specialized_skills ss
      WHERE ss.profile_id = target_profile_id
    ), '[]'::json),
    'experiences', COALESCE((
      SELECT json_agg(json_build_object(
        'companyName', ex.company_name,
        'designation', ex.designation,
        'description', ex.description,
        'startDate', ex.start_date::text,
        'endDate', ex.end_date::text,
        'isCurrent', COALESCE(ex.is_current, false)
      ) ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC)
      FROM experiences ex
      WHERE ex.profile_id = target_profile_id
    ), '[]'::json),
    'education', COALESCE((
      SELECT json_agg(json_build_object(
        'university', ed.university,
        'degree', ed.degree,
        'department', ed.department,
        'gpa', ed.gpa,
        'startDate', ed.start_date::text,
        'endDate', ed.end_date::text,
        'isCurrent', COALESCE(ed.is_current, false)
      ) ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC)
      FROM education ed
      WHERE ed.profile_id = target_profile_id
    ), '[]'::json),
    'trainings', COALESCE((
      SELECT json_agg(json_build_object(
        'title', tr.title,
        'provider', tr.provider,
        'description', tr.description,
        'date', tr.certification_date::text,
        'certificateUrl', tr.certificate_url
      ) ORDER BY tr.certification_date DESC)
      FROM trainings tr
      WHERE tr.profile_id = target_profile_id
    ), '[]'::json),
    'achievements', COALESCE((
      SELECT json_agg(json_build_object(
        'title', ac.title,
        'description', ac.description,
        'date', ac.date::text
      ) ORDER BY ac.date DESC)
      FROM achievements ac
      WHERE ac.profile_id = target_profile_id
    ), '[]'::json),
    'projects', COALESCE((
      SELECT json_agg(json_build_object(
        'name', pr.name,
        'role', pr.role,
        'description', pr.description,
        'responsibility', pr.responsibility,
        'startDate', pr.start_date::text,
        'endDate', pr.end_date::text,
        'isCurrent', COALESCE(pr.is_current, false),
        'technologiesUsed', pr.technologies_used,
        'url', pr.url
      ) ORDER BY pr.is_current DESC NULLS LAST, pr.display_order ASC, pr.start_date DESC)
      FROM projects pr
      WHERE pr.profile_id = target_profile_id
    ), '[]'::json)
  )
  INTO profile_json
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  WHERE p.id = target_profile_id;
  
  RETURN COALESCE(profile_json, '{}'::json);
END;
$function$;

-- Create RPC function to import user profile data from JSON
CREATE OR REPLACE FUNCTION public.import_profile_json(
  profile_data json,
  target_user_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_profile_id uuid;
  import_stats json;
  general_info_updated boolean := false;
  technical_skills_count int := 0;
  specialized_skills_count int := 0;
  experiences_count int := 0;
  education_count int := 0;
  trainings_count int := 0;
  achievements_count int := 0;
  projects_count int := 0;
  skill_record json;
  experience_record json;
  education_record json;
  training_record json;
  achievement_record json;
  project_record json;
BEGIN
  -- If no target_user_id provided, use the authenticated user
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Check if user has permission (admin/manager can import to any profile, users can only import to their own)
  IF target_user_id != auth.uid() AND NOT (
    SELECT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to import to this profile';
  END IF;
  
  -- Get the profile ID from user ID
  SELECT id INTO target_profile_id 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF target_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  -- Handle backward compatibility (personalInfo -> generalInfo)
  IF profile_data->>'personalInfo' IS NOT NULL AND profile_data->>'generalInfo' IS NULL THEN
    profile_data := json_build_object(
      'generalInfo', profile_data->'personalInfo',
      'technicalSkills', profile_data->'technicalSkills',
      'specializedSkills', profile_data->'specializedSkills',
      'experiences', profile_data->'experiences',
      'education', profile_data->'education',
      'trainings', profile_data->'trainings',
      'achievements', profile_data->'achievements',
      'projects', profile_data->'projects'
    );
  END IF;
  
  -- Import general information
  IF profile_data->>'generalInfo' IS NOT NULL THEN
    INSERT INTO general_information (
      profile_id, first_name, last_name, biography, profile_image, current_designation
    ) VALUES (
      target_profile_id,
      profile_data->'generalInfo'->>'firstName',
      profile_data->'generalInfo'->>'lastName',
      profile_data->'generalInfo'->>'biography',
      profile_data->'generalInfo'->>'profileImage',
      profile_data->'generalInfo'->>'current_designation'
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      biography = EXCLUDED.biography,
      profile_image = EXCLUDED.profile_image,
      current_designation = EXCLUDED.current_designation,
      updated_at = now();
    
    general_info_updated := true;
  END IF;
  
  -- Clear existing data before importing new data
  DELETE FROM technical_skills WHERE profile_id = target_profile_id;
  DELETE FROM specialized_skills WHERE profile_id = target_profile_id;
  DELETE FROM experiences WHERE profile_id = target_profile_id;
  DELETE FROM education WHERE profile_id = target_profile_id;
  DELETE FROM trainings WHERE profile_id = target_profile_id;
  DELETE FROM achievements WHERE profile_id = target_profile_id;
  DELETE FROM projects WHERE profile_id = target_profile_id;
  
  -- Import technical skills
  IF profile_data->>'technicalSkills' IS NOT NULL THEN
    FOR skill_record IN SELECT * FROM json_array_elements(profile_data->'technicalSkills')
    LOOP
      IF skill_record->>'name' IS NOT NULL AND trim(skill_record->>'name') != '' THEN
        INSERT INTO technical_skills (profile_id, name, proficiency, priority)
        VALUES (
          target_profile_id,
          trim(skill_record->>'name'),
          COALESCE((skill_record->>'proficiency')::int, 1),
          technical_skills_count
        );
        technical_skills_count := technical_skills_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import specialized skills
  IF profile_data->>'specializedSkills' IS NOT NULL THEN
    FOR skill_record IN SELECT * FROM json_array_elements(profile_data->'specializedSkills')
    LOOP
      IF skill_record->>'name' IS NOT NULL AND trim(skill_record->>'name') != '' THEN
        INSERT INTO specialized_skills (profile_id, name, proficiency, priority)
        VALUES (
          target_profile_id,
          trim(skill_record->>'name'),
          COALESCE((skill_record->>'proficiency')::int, 1),
          specialized_skills_count
        );
        specialized_skills_count := specialized_skills_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import experiences
  IF profile_data->>'experiences' IS NOT NULL THEN
    FOR experience_record IN SELECT * FROM json_array_elements(profile_data->'experiences')
    LOOP
      IF experience_record->>'companyName' IS NOT NULL AND trim(experience_record->>'companyName') != '' 
         AND experience_record->>'designation' IS NOT NULL AND trim(experience_record->>'designation') != '' THEN
        INSERT INTO experiences (
          profile_id, company_name, designation, description, start_date, end_date, is_current
        ) VALUES (
          target_profile_id,
          trim(experience_record->>'companyName'),
          trim(experience_record->>'designation'),
          experience_record->>'description',
          CASE 
            WHEN experience_record->>'startDate' IS NOT NULL AND experience_record->>'startDate' != '' 
            THEN (experience_record->>'startDate')::date
            ELSE NULL
          END,
          CASE 
            WHEN experience_record->>'endDate' IS NOT NULL AND experience_record->>'endDate' != '' 
            THEN (experience_record->>'endDate')::date
            ELSE NULL
          END,
          COALESCE((experience_record->>'isCurrent')::boolean, false)
        );
        experiences_count := experiences_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import education
  IF profile_data->>'education' IS NOT NULL THEN
    FOR education_record IN SELECT * FROM json_array_elements(profile_data->'education')
    LOOP
      IF education_record->>'university' IS NOT NULL AND trim(education_record->>'university') != '' THEN
        INSERT INTO education (
          profile_id, university, degree, department, gpa, start_date, end_date, is_current
        ) VALUES (
          target_profile_id,
          trim(education_record->>'university'),
          education_record->>'degree',
          education_record->>'department',
          education_record->>'gpa',
          CASE 
            WHEN education_record->>'startDate' IS NOT NULL AND education_record->>'startDate' != '' 
            THEN (education_record->>'startDate')::date
            ELSE NULL
          END,
          CASE 
            WHEN education_record->>'endDate' IS NOT NULL AND education_record->>'endDate' != '' 
            THEN (education_record->>'endDate')::date
            ELSE NULL
          END,
          COALESCE((education_record->>'isCurrent')::boolean, false)
        );
        education_count := education_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import trainings
  IF profile_data->>'trainings' IS NOT NULL THEN
    FOR training_record IN SELECT * FROM json_array_elements(profile_data->'trainings')
    LOOP
      IF training_record->>'title' IS NOT NULL AND trim(training_record->>'title') != '' THEN
        INSERT INTO trainings (
          profile_id, title, provider, description, certification_date, certificate_url
        ) VALUES (
          target_profile_id,
          trim(training_record->>'title'),
          training_record->>'provider',
          training_record->>'description',
          CASE 
            WHEN training_record->>'date' IS NOT NULL AND training_record->>'date' != '' 
            THEN (training_record->>'date')::date
            ELSE CURRENT_DATE
          END,
          training_record->>'certificateUrl'
        );
        trainings_count := trainings_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import achievements
  IF profile_data->>'achievements' IS NOT NULL THEN
    FOR achievement_record IN SELECT * FROM json_array_elements(profile_data->'achievements')
    LOOP
      IF achievement_record->>'title' IS NOT NULL AND trim(achievement_record->>'title') != '' 
         AND achievement_record->>'description' IS NOT NULL AND trim(achievement_record->>'description') != '' THEN
        INSERT INTO achievements (
          profile_id, title, description, date
        ) VALUES (
          target_profile_id,
          trim(achievement_record->>'title'),
          trim(achievement_record->>'description'),
          CASE 
            WHEN achievement_record->>'date' IS NOT NULL AND achievement_record->>'date' != '' 
            THEN (achievement_record->>'date')::date
            ELSE CURRENT_DATE
          END
        );
        achievements_count := achievements_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Import projects
  IF profile_data->>'projects' IS NOT NULL THEN
    FOR project_record IN SELECT * FROM json_array_elements(profile_data->'projects')
    LOOP
      IF project_record->>'name' IS NOT NULL AND trim(project_record->>'name') != '' 
         AND project_record->>'description' IS NOT NULL AND trim(project_record->>'description') != '' THEN
        INSERT INTO projects (
          profile_id, name, role, description, responsibility, start_date, end_date, is_current, 
          technologies_used, url, display_order
        ) VALUES (
          target_profile_id,
          trim(project_record->>'name'),
          project_record->>'role',
          trim(project_record->>'description'),
          project_record->>'responsibility',
          CASE 
            WHEN project_record->>'startDate' IS NOT NULL AND project_record->>'startDate' != '' 
            THEN (project_record->>'startDate')::date
            ELSE NULL
          END,
          CASE 
            WHEN project_record->>'endDate' IS NOT NULL AND project_record->>'endDate' != '' 
            THEN (project_record->>'endDate')::date
            ELSE NULL
          END,
          COALESCE((project_record->>'isCurrent')::boolean, false),
          CASE 
            WHEN project_record->>'technologiesUsed' IS NOT NULL 
            THEN ARRAY(SELECT json_array_elements_text(project_record->'technologiesUsed'))
            ELSE ARRAY[]::text[]
          END,
          project_record->>'url',
          projects_count
        );
        projects_count := projects_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  -- Build import statistics
  SELECT json_build_object(
    'success', true,
    'generalInfo', general_info_updated,
    'technicalSkills', technical_skills_count,
    'specializedSkills', specialized_skills_count,
    'experiences', experiences_count,
    'education', education_count,
    'trainings', trainings_count,
    'achievements', achievements_count,
    'projects', projects_count,
    'totalImported', 
      (CASE WHEN general_info_updated THEN 1 ELSE 0 END) +
      technical_skills_count + specialized_skills_count + experiences_count + 
      education_count + trainings_count + achievements_count + projects_count
  ) INTO import_stats;
  
  RETURN import_stats;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;
