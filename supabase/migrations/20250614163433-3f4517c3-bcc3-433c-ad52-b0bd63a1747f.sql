
-- Update the get_employee_profiles function to properly calculate total experience years
CREATE OR REPLACE FUNCTION public.get_employee_profiles(
  search_query text DEFAULT NULL::text, 
  skill_filter text DEFAULT NULL::text, 
  experience_filter text DEFAULT NULL::text, 
  education_filter text DEFAULT NULL::text, 
  training_filter text DEFAULT NULL::text, 
  achievement_filter text DEFAULT NULL::text, 
  project_filter text DEFAULT NULL::text, 
  min_experience_years integer DEFAULT NULL::integer,
  max_experience_years integer DEFAULT NULL::integer,
  completion_status text DEFAULT NULL::text,
  page_number integer DEFAULT 1, 
  items_per_page integer DEFAULT 10, 
  sort_by text DEFAULT 'last_name'::text, 
  sort_order text DEFAULT 'asc'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profiles_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  profiles_array JSON;
BEGIN
  -- Calculate total profiles count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM profiles p;
  
  -- Count filtered results with all the search conditions including new filters
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
  WHERE (
    search_query IS NULL
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.biography ILIKE '%' || search_query || '%'
    OR EXISTS (
      SELECT 1 FROM technical_skills 
      WHERE profile_id = p.id AND name ILIKE '%' || search_query || '%'
    )
    OR EXISTS (
      SELECT 1 FROM specialized_skills 
      WHERE profile_id = p.id AND name ILIKE '%' || search_query || '%'
    )
    OR EXISTS (
      SELECT 1 FROM experiences 
      WHERE profile_id = p.id 
      AND (company_name ILIKE '%' || search_query || '%' 
           OR designation ILIKE '%' || search_query || '%'
           OR description ILIKE '%' || search_query || '%')
    )
    OR EXISTS (
      SELECT 1 FROM education 
      WHERE profile_id = p.id 
      AND (university ILIKE '%' || search_query || '%' 
           OR degree ILIKE '%' || search_query || '%'
           OR department ILIKE '%' || search_query || '%')
    )
    OR EXISTS (
      SELECT 1 FROM trainings 
      WHERE profile_id = p.id 
      AND (title ILIKE '%' || search_query || '%' 
           OR provider ILIKE '%' || search_query || '%'
           OR description ILIKE '%' || search_query || '%')
    )
    OR EXISTS (
      SELECT 1 FROM achievements 
      WHERE profile_id = p.id 
      AND (title ILIKE '%' || search_query || '%' 
           OR description ILIKE '%' || search_query || '%')
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE profile_id = p.id 
      AND (name ILIKE '%' || search_query || '%' 
           OR role ILIKE '%' || search_query || '%'
           OR description ILIKE '%' || search_query || '%')
    )
  )
  AND (
    skill_filter IS NULL 
    OR EXISTS (
      SELECT 1 FROM technical_skills 
      WHERE profile_id = p.id AND name ILIKE '%' || skill_filter || '%'
    )
    OR EXISTS (
      SELECT 1 FROM specialized_skills 
      WHERE profile_id = p.id AND name ILIKE '%' || skill_filter || '%'
    )
  )
  AND (
    experience_filter IS NULL
    OR EXISTS (
      SELECT 1 FROM experiences 
      WHERE profile_id = p.id 
      AND (company_name ILIKE '%' || experience_filter || '%' 
           OR designation ILIKE '%' || experience_filter || '%'
           OR description ILIKE '%' || experience_filter || '%')
    )
  )
  AND (
    education_filter IS NULL
    OR EXISTS (
      SELECT 1 FROM education 
      WHERE profile_id = p.id 
      AND (university ILIKE '%' || education_filter || '%' 
           OR degree ILIKE '%' || education_filter || '%'
           OR department ILIKE '%' || education_filter || '%')
    )
  )
  AND (
    training_filter IS NULL
    OR EXISTS (
      SELECT 1 FROM trainings 
      WHERE profile_id = p.id 
      AND (title ILIKE '%' || training_filter || '%' 
           OR provider ILIKE '%' || training_filter || '%'
           OR description ILIKE '%' || training_filter || '%')
    )
  )
  AND (
    achievement_filter IS NULL
    OR EXISTS (
      SELECT 1 FROM achievements 
      WHERE profile_id = p.id 
      AND (title ILIKE '%' || achievement_filter || '%' 
           OR description ILIKE '%' || achievement_filter || '%')
    )
  )
  AND (
    project_filter IS NULL
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE profile_id = p.id 
      AND (name ILIKE '%' || project_filter || '%' 
           OR role ILIKE '%' || project_filter || '%'
           OR description ILIKE '%' || project_filter || '%')
    )
  )
  -- Total experience years range filter (sum of all experiences)
  AND (
    (min_experience_years IS NULL AND max_experience_years IS NULL)
    OR p.id IN (
      SELECT ex_total.profile_id
      FROM (
        SELECT 
          ex_years.profile_id,
          SUM(
            CASE 
              WHEN ex_years.is_current THEN 
                EXTRACT(YEAR FROM age(CURRENT_DATE, ex_years.start_date))
              ELSE 
                EXTRACT(YEAR FROM age(COALESCE(ex_years.end_date, CURRENT_DATE), ex_years.start_date))
            END
          ) as total_experience_years
        FROM experiences ex_years 
        WHERE ex_years.start_date IS NOT NULL
        GROUP BY ex_years.profile_id
      ) ex_total
      WHERE ex_total.total_experience_years BETWEEN COALESCE(min_experience_years, 0) AND COALESCE(max_experience_years, 100)
    )
  )
  -- Profile completion status filter
  AND (
    completion_status IS NULL
    OR completion_status = 'all'
    OR (
      completion_status = 'complete' 
      AND EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
      AND EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
      AND EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
      AND EXISTS (SELECT 1 FROM projects pr_comp WHERE pr_comp.profile_id = p.id)
    )
    OR (
      completion_status = 'incomplete'
      AND NOT (
        EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM projects pr_comp WHERE pr_comp.profile_id = p.id)
      )
    )
    OR (
      completion_status = 'no-skills'
      AND NOT EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
    )
    OR (
      completion_status = 'no-experience'
      AND NOT EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
    )
    OR (
      completion_status = 'no-education'
      AND NOT EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
    )
  );
  
  -- Build profiles query with proper sorting, filtering, and pagination
  WITH filtered_profiles AS (
    SELECT DISTINCT p.id
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN technical_skills ts ON p.id = ts.profile_id
    LEFT JOIN specialized_skills ss ON p.id = ss.profile_id
    LEFT JOIN experiences ex ON p.id = ex.profile_id
    LEFT JOIN education ed ON p.id = ed.profile_id
    LEFT JOIN trainings tr ON p.id = tr.profile_id
    LEFT JOIN achievements ac ON p.id = ac.profile_id
    LEFT JOIN projects pr ON p.id = pr.profile_id
    WHERE (
      search_query IS NULL
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.biography ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM technical_skills 
        WHERE profile_id = p.id AND name ILIKE '%' || search_query || '%'
      )
      OR EXISTS (
        SELECT 1 FROM specialized_skills 
        WHERE profile_id = p.id AND name ILIKE '%' || search_query || '%'
      )
      OR EXISTS (
        SELECT 1 FROM experiences 
        WHERE profile_id = p.id 
        AND (company_name ILIKE '%' || search_query || '%' 
             OR designation ILIKE '%' || search_query || '%'
             OR description ILIKE '%' || search_query || '%')
      )
      OR EXISTS (
        SELECT 1 FROM education 
        WHERE profile_id = p.id 
        AND (university ILIKE '%' || search_query || '%' 
             OR degree ILIKE '%' || search_query || '%'
             OR department ILIKE '%' || search_query || '%')
      )
      OR EXISTS (
        SELECT 1 FROM trainings 
        WHERE profile_id = p.id 
        AND (title ILIKE '%' || search_query || '%' 
             OR provider ILIKE '%' || training_filter || '%'
             OR description ILIKE '%' || search_query || '%')
      )
      OR EXISTS (
        SELECT 1 FROM achievements 
        WHERE profile_id = p.id 
        AND (title ILIKE '%' || search_query || '%' 
             OR description ILIKE '%' || search_query || '%')
      )
      OR EXISTS (
        SELECT 1 FROM projects 
        WHERE profile_id = p.id 
        AND (name ILIKE '%' || search_query || '%' 
             OR role ILIKE '%' || search_query || '%'
             OR description ILIKE '%' || search_query || '%')
      )
    )
    AND (
      skill_filter IS NULL 
      OR EXISTS (
        SELECT 1 FROM technical_skills 
        WHERE profile_id = p.id AND name ILIKE '%' || skill_filter || '%'
      )
      OR EXISTS (
        SELECT 1 FROM specialized_skills 
        WHERE profile_id = p.id AND name ILIKE '%' || skill_filter || '%'
      )
    )
    AND (
      experience_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM experiences 
        WHERE profile_id = p.id 
        AND (company_name ILIKE '%' || experience_filter || '%' 
             OR designation ILIKE '%' || experience_filter || '%'
             OR description ILIKE '%' || experience_filter || '%')
      )
    )
    AND (
      education_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM education 
        WHERE profile_id = p.id 
        AND (university ILIKE '%' || education_filter || '%' 
             OR degree ILIKE '%' || education_filter || '%'
             OR department ILIKE '%' || education_filter || '%')
      )
    )
    AND (
      training_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM trainings 
        WHERE profile_id = p.id 
        AND (title ILIKE '%' || training_filter || '%' 
             OR provider ILIKE '%' || training_filter || '%'
             OR description ILIKE '%' || training_filter || '%')
      )
    )
    AND (
      achievement_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM achievements 
        WHERE profile_id = p.id 
        AND (title ILIKE '%' || achievement_filter || '%' 
             OR description ILIKE '%' || achievement_filter || '%')
      )
    )
    AND (
      project_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM projects 
        WHERE profile_id = p.id 
        AND (name ILIKE '%' || project_filter || '%' 
             OR role ILIKE '%' || project_filter || '%'
             OR description ILIKE '%' || project_filter || '%')
      )
    )
    -- Total experience years range filter (sum of all experiences)
    AND (
      (min_experience_years IS NULL AND max_experience_years IS NULL)
      OR p.id IN (
        SELECT ex_total.profile_id
        FROM (
          SELECT 
            ex_years.profile_id,
            SUM(
              CASE 
                WHEN ex_years.is_current THEN 
                  EXTRACT(YEAR FROM age(CURRENT_DATE, ex_years.start_date))
                ELSE 
                  EXTRACT(YEAR FROM age(COALESCE(ex_years.end_date, CURRENT_DATE), ex_years.start_date))
              END
            ) as total_experience_years
          FROM experiences ex_years 
          WHERE ex_years.start_date IS NOT NULL
          GROUP BY ex_years.profile_id
        ) ex_total
        WHERE ex_total.total_experience_years BETWEEN COALESCE(min_experience_years, 0) AND COALESCE(max_experience_years, 100)
      )
    )
    -- Profile completion status filter
    AND (
      completion_status IS NULL
      OR completion_status = 'all'
      OR (
        completion_status = 'complete' 
        AND EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
        AND EXISTS (SELECT 1 FROM projects pr_comp WHERE pr_comp.profile_id = p.id)
      )
      OR (
        completion_status = 'incomplete'
        AND NOT (
          EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
          AND EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
          AND EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
          AND EXISTS (SELECT 1 FROM projects pr_comp WHERE pr_comp.profile_id = p.id)
        )
      )
      OR (
        completion_status = 'no-skills'
        AND NOT EXISTS (SELECT 1 FROM technical_skills ts_comp WHERE ts_comp.profile_id = p.id UNION SELECT 1 FROM specialized_skills ss_comp WHERE ss_comp.profile_id = p.id)
      )
      OR (
        completion_status = 'no-experience'
        AND NOT EXISTS (SELECT 1 FROM experiences ex_comp WHERE ex_comp.profile_id = p.id)
      )
      OR (
        completion_status = 'no-education'
        AND NOT EXISTS (SELECT 1 FROM education ed_comp WHERE ed_comp.profile_id = p.id)
      )
    )
  )
  SELECT json_agg(row_to_json(profile_data))
  INTO profiles_array
  FROM (
    SELECT 
      p.id,
      p.employee_id,
      p.first_name,
      p.last_name,
      p.created_at,
      p.updated_at,
      gi.biography,
      gi.profile_image,
      (
        SELECT json_agg(json_build_object(
          'id', ts.id,
          'name', ts.name,
          'proficiency', ts.proficiency
        ))
        FROM technical_skills ts
        WHERE ts.profile_id = p.id
      ) AS technical_skills,
      (
        SELECT json_agg(json_build_object(
          'id', ss.id,
          'name', ss.name,
          'proficiency', ss.proficiency
        ))
        FROM specialized_skills ss
        WHERE ss.profile_id = p.id
      ) AS specialized_skills,
      (
        SELECT json_agg(json_build_object(
          'id', ex.id,
          'company_name', ex.company_name,
          'designation', ex.designation,
          'start_date', ex.start_date,
          'end_date', ex.end_date,
          'is_current', ex.is_current,
          'description', ex.description
        ))
        FROM experiences ex
        WHERE ex.profile_id = p.id
      ) AS experiences,
      (
        SELECT json_agg(json_build_object(
          'id', ed.id,
          'university', ed.university,
          'degree', ed.degree,
          'department', ed.department,
          'start_date', ed.start_date,
          'end_date', ed.end_date,
          'is_current', ed.is_current,
          'gpa', ed.gpa
        ))
        FROM education ed
        WHERE ed.profile_id = p.id
      ) AS education,
      (
        SELECT json_agg(json_build_object(
          'id', tr.id,
          'title', tr.title,
          'provider', tr.provider,
          'certification_date', tr.certification_date,
          'description', tr.description,
          'certificate_url', tr.certificate_url
        ))
        FROM trainings tr
        WHERE tr.profile_id = p.id
      ) AS trainings,
      (
        SELECT json_agg(json_build_object(
          'id', ac.id,
          'title', ac.title,
          'date', ac.date,
          'description', ac.description
        ))
        FROM achievements ac
        WHERE ac.profile_id = p.id
      ) AS achievements,
      (
        SELECT json_agg(json_build_object(
          'id', pr.id,
          'name', pr.name,
          'role', pr.role,
          'start_date', pr.start_date,
          'end_date', pr.end_date,
          'is_current', pr.is_current,
          'description', pr.description,
          'technologies_used', pr.technologies_used,
          'url', pr.url
        ))
        FROM projects pr
        WHERE pr.profile_id = p.id
      ) AS projects
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    JOIN filtered_profiles fp ON p.id = fp.id
    ORDER BY
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'asc' THEN p.updated_at END ASC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'desc' THEN p.updated_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('first_name', 'last_name', 'employee_id', 'created_at', 'updated_at')) 
        AND (sort_order IS NULL OR sort_order = 'asc') THEN p.last_name END ASC
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
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO profiles_data;
  
  RETURN profiles_data;
END;
$function$
