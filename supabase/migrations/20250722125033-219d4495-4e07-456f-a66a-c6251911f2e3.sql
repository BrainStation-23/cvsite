
-- Drop the existing function completely
DROP FUNCTION IF EXISTS public.get_employee_profiles(text, text, text, text, text, text, text, integer, integer, integer, integer, text, integer, integer, text, text);

-- Create a completely rewritten function with better performance
CREATE OR REPLACE FUNCTION public.get_employee_profiles(
  search_query text DEFAULT NULL,
  skill_filter text DEFAULT NULL,
  experience_filter text DEFAULT NULL,
  education_filter text DEFAULT NULL,
  training_filter text DEFAULT NULL,
  achievement_filter text DEFAULT NULL,
  project_filter text DEFAULT NULL,
  min_experience_years integer DEFAULT NULL,
  max_experience_years integer DEFAULT NULL,
  min_graduation_year integer DEFAULT NULL,
  max_graduation_year integer DEFAULT NULL,
  completion_status text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'last_name',
  sort_order text DEFAULT 'asc'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profiles_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  profiles_array JSON;
BEGIN
  -- Calculate total profiles count (simple and fast)
  SELECT COUNT(*)
  INTO total_count
  FROM profiles;
  
  -- Use CTE for efficient filtering and counting
  WITH filtered_profiles AS (
    SELECT DISTINCT p.id
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE (
      search_query IS NULL
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR gi.biography ILIKE '%' || search_query || '%'
      OR gi.current_designation ILIKE '%' || search_query || '%'
      OR et.name ILIKE '%' || search_query || '%'
    )
    AND (
      skill_filter IS NULL OR EXISTS (
        SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id AND ts.name ILIKE '%' || skill_filter || '%'
        UNION
        SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id AND ss.name ILIKE '%' || skill_filter || '%'
      )
    )
    AND (
      experience_filter IS NULL OR EXISTS (
        SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id 
        AND (ex.company_name ILIKE '%' || experience_filter || '%' OR ex.designation ILIKE '%' || experience_filter || '%')
      )
    )
    AND (
      education_filter IS NULL OR EXISTS (
        SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
        AND (ed.university ILIKE '%' || education_filter || '%' OR ed.degree ILIKE '%' || education_filter || '%' OR ed.department ILIKE '%' || education_filter || '%')
      )
    )
    AND (
      training_filter IS NULL OR EXISTS (
        SELECT 1 FROM trainings tr WHERE tr.profile_id = p.id 
        AND (tr.title ILIKE '%' || training_filter || '%' OR tr.provider ILIKE '%' || training_filter || '%')
      )
    )
    AND (
      achievement_filter IS NULL OR EXISTS (
        SELECT 1 FROM achievements ac WHERE ac.profile_id = p.id 
        AND (ac.title ILIKE '%' || achievement_filter || '%' OR ac.description ILIKE '%' || achievement_filter || '%')
      )
    )
    AND (
      project_filter IS NULL OR EXISTS (
        SELECT 1 FROM projects pr WHERE pr.profile_id = p.id 
        AND (pr.name ILIKE '%' || project_filter || '%' OR pr.description ILIKE '%' || project_filter || '%' OR pr.responsibility ILIKE '%' || project_filter || '%')
      )
    )
    AND (
      min_experience_years IS NULL OR 
      (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) >= min_experience_years)
    )
    AND (
      max_experience_years IS NULL OR 
      (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) <= max_experience_years)
    )
    AND (
      min_graduation_year IS NULL OR EXISTS (
        SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
        AND ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) >= min_graduation_year
      )
    )
    AND (
      max_graduation_year IS NULL OR EXISTS (
        SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
        AND ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) <= max_graduation_year
      )
    )
  )
  SELECT COUNT(*) INTO filtered_count FROM filtered_profiles;
  
  -- Get paginated results with minimal data
  SELECT json_agg(row_to_json(profile_data))
  INTO profiles_array
  FROM (
    SELECT 
      p.id,
      p.employee_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      p.email,
      p.created_at,
      p.updated_at,
      p.date_of_joining,
      p.career_start_date,
      p.expertise as expertise_id,
      et.name as expertise_name,
      -- Calculate experience efficiently
      CASE 
        WHEN p.career_start_date IS NOT NULL THEN 
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date))
        ELSE NULL
      END as total_experience_years,
      CASE 
        WHEN p.date_of_joining IS NOT NULL THEN 
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining))
        ELSE NULL
      END as company_experience_years,
      -- General information (direct fields, not subquery)
      gi.biography,
      gi.profile_image,
      gi.current_designation,
      -- Get top 3 technical skills only (limit data transfer)
      (
        SELECT json_agg(
          json_build_object(
            'id', ts.id,
            'name', ts.name,
            'proficiency', ts.proficiency,
            'priority', ts.priority
          )
          ORDER BY ts.priority ASC, ts.name ASC
        )
        FROM (
          SELECT * FROM technical_skills WHERE profile_id = p.id ORDER BY priority ASC, name ASC LIMIT 3
        ) ts
      ) as technical_skills,
      -- Get top 3 specialized skills only
      (
        SELECT json_agg(
          json_build_object(
            'id', ss.id,
            'name', ss.name,
            'proficiency', ss.proficiency
          )
          ORDER BY ss.name ASC
        )
        FROM (
          SELECT * FROM specialized_skills WHERE profile_id = p.id ORDER BY name ASC LIMIT 3
        ) ss
      ) as specialized_skills,
      -- Get only current experience or latest 2
      (
        SELECT json_agg(
          json_build_object(
            'id', ex.id,
            'company_name', ex.company_name,
            'designation', ex.designation,
            'start_date', ex.start_date,
            'end_date', ex.end_date,
            'is_current', ex.is_current
          )
          ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
        )
        FROM (
          SELECT * FROM experiences WHERE profile_id = p.id 
          ORDER BY is_current DESC NULLS LAST, start_date DESC LIMIT 2
        ) ex
      ) as experiences,
      -- Get latest 2 education entries only
      (
        SELECT json_agg(
          json_build_object(
            'id', ed.id,
            'university', ed.university,
            'degree', ed.degree,
            'department', ed.department,
            'end_date', ed.end_date
          )
          ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
        )
        FROM (
          SELECT * FROM education WHERE profile_id = p.id 
          ORDER BY is_current DESC NULLS LAST, start_date DESC LIMIT 2
        ) ed
      ) as education,
      -- Get latest 3 trainings only
      (
        SELECT json_agg(
          json_build_object(
            'id', tr.id,
            'title', tr.title,
            'provider', tr.provider,
            'certification_date', tr.certification_date
          )
          ORDER BY tr.certification_date DESC
        )
        FROM (
          SELECT * FROM trainings WHERE profile_id = p.id 
          ORDER BY certification_date DESC LIMIT 3
        ) tr
      ) as trainings
    FROM filtered_profiles fp
    JOIN profiles p ON fp.id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    ORDER BY
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name) END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name) END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN COALESCE(gi.last_name, p.last_name) END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN COALESCE(gi.last_name, p.last_name) END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      CASE WHEN sort_by = 'total_experience' AND sort_order = 'asc' THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) END ASC,
      CASE WHEN sort_by = 'total_experience' AND sort_order = 'desc' THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) END DESC,
      CASE WHEN sort_by = 'company_experience' AND sort_order = 'asc' THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) END ASC,
      CASE WHEN sort_by = 'company_experience' AND sort_order = 'desc' THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) END DESC,
      COALESCE(gi.last_name, p.last_name) ASC -- Default fallback
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) AS profile_data;
  
  -- Build final result JSON
  SELECT json_build_object(
    'profiles', COALESCE(profiles_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO profiles_data;
  
  RETURN profiles_data;
END;
$$;

-- Add essential indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_career_start ON profiles(career_start_date);
CREATE INDEX IF NOT EXISTS idx_profiles_expertise ON profiles(expertise);
CREATE INDEX IF NOT EXISTS idx_general_info_profile ON general_information(profile_id);
CREATE INDEX IF NOT EXISTS idx_technical_skills_profile ON technical_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_specialized_skills_profile ON specialized_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_profile ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_trainings_profile ON trainings(profile_id);
CREATE INDEX IF NOT EXISTS idx_achievements_profile ON achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_profile ON projects(profile_id);
