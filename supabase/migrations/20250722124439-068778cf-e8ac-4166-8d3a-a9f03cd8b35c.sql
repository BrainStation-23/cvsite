
-- Create or replace the get_employee_profiles function with a working implementation
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
  -- Calculate total profiles count (unfiltered)
  SELECT COUNT(DISTINCT p.id)
  INTO total_count
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id;
  
  -- Count filtered results
  SELECT COUNT(DISTINCT p.id)
  INTO filtered_count
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN technical_skills ts ON p.id = ts.profile_id
  LEFT JOIN specialized_skills ss ON p.id = ss.profile_id
  LEFT JOIN experiences ex ON p.id = ex.profile_id
  LEFT JOIN education ed ON p.id = ed.profile_id
  LEFT JOIN trainings tr ON p.id = tr.profile_id
  LEFT JOIN achievements ac ON p.id = ac.profile_id
  LEFT JOIN projects pr ON p.id = pr.profile_id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  WHERE (
    search_query IS NULL
    OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.biography, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.current_designation, '') ILIKE '%' || search_query || '%'
    OR COALESCE(et.name, '') ILIKE '%' || search_query || '%'
  )
  AND (skill_filter IS NULL OR ts.name ILIKE '%' || skill_filter || '%' OR ss.name ILIKE '%' || skill_filter || '%')
  AND (experience_filter IS NULL OR ex.company_name ILIKE '%' || experience_filter || '%' OR ex.designation ILIKE '%' || experience_filter || '%')
  AND (education_filter IS NULL OR ed.university ILIKE '%' || education_filter || '%' OR ed.degree ILIKE '%' || education_filter || '%' OR ed.department ILIKE '%' || education_filter || '%')
  AND (training_filter IS NULL OR tr.title ILIKE '%' || training_filter || '%' OR tr.provider ILIKE '%' || training_filter || '%')
  AND (achievement_filter IS NULL OR ac.title ILIKE '%' || achievement_filter || '%' OR ac.description ILIKE '%' || achievement_filter || '%')
  AND (project_filter IS NULL OR pr.name ILIKE '%' || project_filter || '%' OR pr.description ILIKE '%' || project_filter || '%' OR pr.responsibility ILIKE '%' || project_filter || '%')
  AND (
    min_experience_years IS NULL OR 
    (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) >= min_experience_years)
  )
  AND (
    max_experience_years IS NULL OR 
    (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) <= max_experience_years)
  )
  AND (
    min_graduation_year IS NULL OR 
    (ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) >= min_graduation_year)
  )
  AND (
    max_graduation_year IS NULL OR 
    (ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) <= max_graduation_year)
  );
  
  -- Build profiles query with all required data
  SELECT json_agg(row_to_json(profile_data))
  INTO profiles_array
  FROM (
    SELECT DISTINCT ON (p.id)
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
      -- Calculate years of experience
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
      -- General information
      json_build_object(
        'first_name', gi.first_name,
        'last_name', gi.last_name,
        'biography', gi.biography,
        'profile_image', gi.profile_image,
        'current_designation', gi.current_designation
      ) as general_information,
      -- Technical skills
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', ts.id,
            'name', ts.name,
            'proficiency', ts.proficiency,
            'priority', ts.priority
          )
          ORDER BY ts.priority ASC, ts.name ASC
        )
        FROM technical_skills ts
        WHERE ts.profile_id = p.id
      ), '[]'::json) as technical_skills,
      -- Specialized skills
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', ss.id,
            'name', ss.name,
            'proficiency', ss.proficiency
          )
          ORDER BY ss.name ASC
        )
        FROM specialized_skills ss
        WHERE ss.profile_id = p.id
      ), '[]'::json) as specialized_skills,
      -- Trainings
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', tr.id,
            'title', tr.title,
            'provider', tr.provider,
            'certification_date', tr.certification_date,
            'is_renewable', tr.is_renewable,
            'expiry_date', tr.expiry_date,
            'certificate_url', tr.certificate_url
          )
          ORDER BY tr.certification_date DESC
        )
        FROM trainings tr
        WHERE tr.profile_id = p.id
      ), '[]'::json) as trainings
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN technical_skills ts ON p.id = ts.profile_id
    LEFT JOIN specialized_skills ss ON p.id = ss.profile_id
    LEFT JOIN experiences ex ON p.id = ex.profile_id
    LEFT JOIN education ed ON p.id = ed.profile_id
    LEFT JOIN trainings tr ON p.id = tr.profile_id
    LEFT JOIN achievements ac ON p.id = ac.profile_id
    LEFT JOIN projects pr ON p.id = pr.profile_id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE (
      search_query IS NULL
      OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.biography, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.current_designation, '') ILIKE '%' || search_query || '%'
      OR COALESCE(et.name, '') ILIKE '%' || search_query || '%'
    )
    AND (skill_filter IS NULL OR ts.name ILIKE '%' || skill_filter || '%' OR ss.name ILIKE '%' || skill_filter || '%')
    AND (experience_filter IS NULL OR ex.company_name ILIKE '%' || experience_filter || '%' OR ex.designation ILIKE '%' || experience_filter || '%')
    AND (education_filter IS NULL OR ed.university ILIKE '%' || education_filter || '%' OR ed.degree ILIKE '%' || education_filter || '%' OR ed.department ILIKE '%' || education_filter || '%')
    AND (training_filter IS NULL OR tr.title ILIKE '%' || training_filter || '%' OR tr.provider ILIKE '%' || training_filter || '%')
    AND (achievement_filter IS NULL OR ac.title ILIKE '%' || achievement_filter || '%' OR ac.description ILIKE '%' || achievement_filter || '%')
    AND (project_filter IS NULL OR pr.name ILIKE '%' || project_filter || '%' OR pr.description ILIKE '%' || project_filter || '%' OR pr.responsibility ILIKE '%' || project_filter || '%')
    AND (
      min_experience_years IS NULL OR 
      (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) >= min_experience_years)
    )
    AND (
      max_experience_years IS NULL OR 
      (p.career_start_date IS NOT NULL AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) <= max_experience_years)
    )
    AND (
      min_graduation_year IS NULL OR 
      (ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) >= min_graduation_year)
    )
    AND (
      max_graduation_year IS NULL OR 
      (ed.end_date IS NOT NULL AND EXTRACT(YEAR FROM ed.end_date) <= max_graduation_year)
    )
    ORDER BY p.id,
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
