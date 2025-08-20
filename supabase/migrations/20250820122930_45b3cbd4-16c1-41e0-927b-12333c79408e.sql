
CREATE OR REPLACE FUNCTION public.get_incomplete_cv_profiles_paginated(
  resource_type_filter uuid DEFAULT NULL::uuid,
  search_term text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  page_size integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
  total_count integer;
  filtered_count integer;
  profiles_array json;
BEGIN
  -- Get total count of incomplete profiles (unfiltered)
  WITH incomplete_profiles_base AS (
    SELECT DISTINCT
      p.id as profile_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      p.employee_id,
      p.resource_type as resource_type_id,
      rt.name as resource_type_name,
      
      -- Calculate completion score
      (
        (CASE WHEN gi.id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM experiences e WHERE e.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM education ed WHERE ed.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM trainings t WHERE t.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM achievements a WHERE a.profile_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM projects pr WHERE pr.profile_id = p.id) THEN 1 ELSE 0 END)
      ) as completion_score,
      
      8 as total_sections,
      
      -- Calculate missing sections
      ARRAY_REMOVE(ARRAY[
        CASE WHEN gi.id IS NULL THEN 'general_information' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id) THEN 'technical_skills' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id) THEN 'specialized_skills' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM experiences e WHERE e.profile_id = p.id) THEN 'experiences' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM education ed WHERE ed.profile_id = p.id) THEN 'education' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM trainings t WHERE t.profile_id = p.id) THEN 'trainings' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM achievements a WHERE a.profile_id = p.id) THEN 'achievements' ELSE NULL END,
        CASE WHEN NOT EXISTS(SELECT 1 FROM projects pr WHERE pr.profile_id = p.id) THEN 'projects' ELSE NULL END
      ], NULL) as missing_sections
      
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    WHERE p.id IS NOT NULL
  ),
  incomplete_profiles AS (
    SELECT *,
      array_length(missing_sections, 1) as missing_count
    FROM incomplete_profiles_base
    WHERE array_length(missing_sections, 1) > 0
  )
  
  -- Calculate total count
  SELECT COUNT(*) INTO total_count FROM incomplete_profiles;
  
  -- Apply filters and count filtered results
  WITH filtered_profiles AS (
    SELECT *
    FROM incomplete_profiles
    WHERE (
      resource_type_filter IS NULL 
      OR resource_type_id = resource_type_filter
    )
    AND (
      search_term IS NULL
      OR first_name ILIKE '%' || search_term || '%'
      OR last_name ILIKE '%' || search_term || '%'
      OR employee_id ILIKE '%' || search_term || '%'
    )
  )
  SELECT COUNT(*) INTO filtered_count FROM filtered_profiles;
  
  -- Get paginated results
  SELECT json_agg(
    json_build_object(
      'profile_id', fp.profile_id,
      'first_name', fp.first_name,
      'last_name', fp.last_name,
      'employee_id', fp.employee_id,
      'resource_type_id', fp.resource_type_id,
      'resource_type_name', fp.resource_type_name,
      'completion_score', fp.completion_score,
      'total_sections', fp.total_sections,
      'missing_sections', fp.missing_sections,
      'missing_count', fp.missing_count
    )
    ORDER BY fp.missing_count DESC, fp.first_name ASC, fp.last_name ASC
  )
  INTO profiles_array
  FROM (
    SELECT *
    FROM incomplete_profiles
    WHERE (
      resource_type_filter IS NULL 
      OR resource_type_id = resource_type_filter
    )
    AND (
      search_term IS NULL
      OR first_name ILIKE '%' || search_term || '%'
      OR last_name ILIKE '%' || search_term || '%'
      OR employee_id ILIKE '%' || search_term || '%'
    )
    ORDER BY missing_count DESC, first_name ASC, last_name ASC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  ) fp;
  
  -- Build final result
  SELECT json_build_object(
    'profiles', COALESCE(profiles_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', page_size,
      'page_count', CEIL(filtered_count::numeric / page_size)
    )
  ) INTO result;
  
  RETURN result;
END;
$function$
