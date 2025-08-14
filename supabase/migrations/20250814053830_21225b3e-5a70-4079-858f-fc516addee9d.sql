
-- Update the get_employee_profiles RPC function to use resource_availability_view
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
  min_graduation_year integer DEFAULT NULL::integer,
  max_graduation_year integer DEFAULT NULL::integer,
  completion_status text DEFAULT NULL::text,
  min_engagement_percentage real DEFAULT NULL::real,
  max_engagement_percentage real DEFAULT NULL::real,
  min_billing_percentage real DEFAULT NULL::real,
  max_billing_percentage real DEFAULT NULL::real,
  release_date_from text DEFAULT NULL::text,
  release_date_to text DEFAULT NULL::text,
  availability_status text DEFAULT NULL::text,
  current_project_search text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'last_name'::text,
  sort_order text DEFAULT 'asc'::text
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
  base_query TEXT;
  count_query TEXT;
  final_query TEXT;
BEGIN
  -- Simple total count
  SELECT COUNT(*) INTO total_count FROM profiles;
  
  -- Build the base WHERE clause with resource availability view
  base_query := '
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN resource_availability_view rav ON p.id = rav.profile_id
    WHERE 1=1';
  
  -- Add existing search conditions
  IF search_query IS NOT NULL THEN
    base_query := base_query || '
      AND (
        p.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR p.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR p.employee_id ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.biography ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.current_designation ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR et.name ILIKE ' || quote_literal('%' || search_query || '%') || '
      )';
  END IF;
  
  -- Add skill filter
  IF skill_filter IS NOT NULL THEN
    base_query := base_query || '
      AND (
        EXISTS (SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id AND ts.name ILIKE ' || quote_literal('%' || skill_filter || '%') || ')
        OR EXISTS (SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id AND ss.name ILIKE ' || quote_literal('%' || skill_filter || '%') || ')
      )';
  END IF;
  
  -- Add experience filter
  IF experience_filter IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id 
        AND (ex.company_name ILIKE ' || quote_literal('%' || experience_filter || '%') || ' OR ex.designation ILIKE ' || quote_literal('%' || experience_filter || '%') || ')
      )';
  END IF;
  
  -- Add education filter
  IF education_filter IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
        AND (ed.university ILIKE ' || quote_literal('%' || education_filter || '%') || ' OR ed.degree ILIKE ' || quote_literal('%' || education_filter || '%') || ' OR ed.department ILIKE ' || quote_literal('%' || education_filter || '%') || ')
      )';
  END IF;
  
  -- Add training filter
  IF training_filter IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM trainings tr WHERE tr.profile_id = p.id 
        AND (tr.title ILIKE ' || quote_literal('%' || training_filter || '%') || ' OR tr.provider ILIKE ' || quote_literal('%' || training_filter || '%') || ')
      )';
  END IF;
  
  -- Add achievement filter
  IF achievement_filter IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM achievements ac WHERE ac.profile_id = p.id 
        AND (ac.title ILIKE ' || quote_literal('%' || achievement_filter || '%') || ' OR ac.description ILIKE ' || quote_literal('%' || achievement_filter || '%') || ')
      )';
  END IF;
  
  -- Add project filter
  IF project_filter IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM projects pr WHERE pr.profile_id = p.id 
        AND (pr.name ILIKE ' || quote_literal('%' || project_filter || '%') || ' OR pr.description ILIKE ' || quote_literal('%' || project_filter || '%') || ' OR pr.responsibility ILIKE ' || quote_literal('%' || project_filter || '%') || ' OR pr.technologies_used::text ILIKE ' || quote_literal('%' || project_filter || '%') || ')
      )';
  END IF;
  
  -- Add experience years filters based on calculated experience from experiences table
  IF min_experience_years IS NOT NULL OR max_experience_years IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM (
          SELECT 
            ex.profile_id,
            SUM(
              CASE 
                WHEN ex.is_current THEN 
                  EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
                ELSE 
                  EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
              END
            ) as total_years
          FROM experiences ex
          WHERE ex.start_date IS NOT NULL
          GROUP BY ex.profile_id
        ) exp_calc 
        WHERE exp_calc.profile_id = p.id';
        
    IF min_experience_years IS NOT NULL THEN
      base_query := base_query || ' AND exp_calc.total_years >= ' || min_experience_years;
    END IF;
    
    IF max_experience_years IS NOT NULL THEN
      base_query := base_query || ' AND exp_calc.total_years <= ' || max_experience_years;
    END IF;
    
    base_query := base_query || ')';
  END IF;
  
  -- Add graduation year filters
  IF min_graduation_year IS NOT NULL OR max_graduation_year IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
        AND ed.end_date IS NOT NULL';
    
    IF min_graduation_year IS NOT NULL THEN
      base_query := base_query || ' AND EXTRACT(YEAR FROM ed.end_date) >= ' || min_graduation_year;
    END IF;
    
    IF max_graduation_year IS NOT NULL THEN
      base_query := base_query || ' AND EXTRACT(YEAR FROM ed.end_date) <= ' || max_graduation_year;
    END IF;
    
    base_query := base_query || ')';
  END IF;
  
  -- Updated resource planning filters using resource_availability_view
  IF min_engagement_percentage IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.cumulative_engagement_percent IS NULL OR rav.cumulative_engagement_percent >= ' || min_engagement_percentage || ')';
  END IF;
  
  IF max_engagement_percentage IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.cumulative_engagement_percent IS NULL OR rav.cumulative_engagement_percent <= ' || max_engagement_percentage || ')';
  END IF;
  
  IF min_billing_percentage IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.cumulative_billing_percent IS NULL OR rav.cumulative_billing_percent >= ' || min_billing_percentage || ')';
  END IF;
  
  IF max_billing_percentage IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.cumulative_billing_percent IS NULL OR rav.cumulative_billing_percent <= ' || max_billing_percentage || ')';
  END IF;
  
  IF release_date_from IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.final_release_date IS NULL OR rav.final_release_date >= ' || quote_literal(release_date_from) || ')';
  END IF;
  
  IF release_date_to IS NOT NULL THEN
    base_query := base_query || '
      AND (rav.final_release_date IS NULL OR rav.final_release_date <= ' || quote_literal(release_date_to) || ')';
  END IF;
  
  IF availability_status IS NOT NULL AND availability_status != 'all' THEN
    base_query := base_query || '
      AND rav.availability_status = ' || quote_literal(availability_status);
  END IF;
  
  IF current_project_search IS NOT NULL THEN
    base_query := base_query || '
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(rav.breakdown) AS breakdown_item
        WHERE breakdown_item->>''project_name'' ILIKE ' || quote_literal('%' || current_project_search || '%') || '
      )';
  END IF;
  
  -- Count filtered results
  count_query := 'SELECT COUNT(DISTINCT p.id) ' || base_query;
  EXECUTE count_query INTO filtered_count;
  
  -- Build final query for data with resource planning information from view
  final_query := '
    SELECT json_agg(row_to_json(profile_data))
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
        -- Calculate total experience years from experiences table
        COALESCE((
          SELECT SUM(
            CASE 
              WHEN ex.is_current THEN 
                EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
              ELSE 
                EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
            END
          )
          FROM experiences ex 
          WHERE ex.profile_id = p.id AND ex.start_date IS NOT NULL
        ), 0) as total_experience_years,
        CASE 
          WHEN p.date_of_joining IS NOT NULL THEN 
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining))
          ELSE NULL
        END as company_experience_years,
        gi.biography,
        gi.profile_image,
        gi.current_designation,
        -- Resource Planning Information from resource_availability_view
        CASE 
          WHEN rav.profile_id IS NOT NULL THEN 
            json_build_object(
              ''availability_status'', rav.availability_status,
              ''days_until_available'', rav.days_until_available,
              ''cumulative_engagement_percent'', rav.cumulative_engagement_percent,
              ''cumulative_billing_percent'', rav.cumulative_billing_percent,
              ''final_release_date'', rav.final_release_date,
              ''breakdown'', rav.breakdown
            )
          ELSE json_build_object(
            ''availability_status'', ''available'',
            ''days_until_available'', 0,
            ''cumulative_engagement_percent'', 0,
            ''cumulative_billing_percent'', 0,
            ''final_release_date'', null,
            ''breakdown'', ''[]''::json
          )
        END as resource_planning,
        (
          SELECT json_agg(
            json_build_object(
              ''id'', ts.id,
              ''name'', ts.name,
              ''proficiency'', ts.proficiency,
              ''priority'', ts.priority
            )
            ORDER BY ts.priority ASC, ts.name ASC
          )
          FROM (
            SELECT * FROM technical_skills WHERE profile_id = p.id ORDER BY priority ASC, name ASC
          ) ts
        ) as technical_skills,
        (
          SELECT json_agg(
            json_build_object(
              ''id'', ss.id,
              ''name'', ss.name,
              ''proficiency'', ss.proficiency
            )
            ORDER BY ss.name ASC
          )
          FROM (
            SELECT * FROM specialized_skills WHERE profile_id = p.id ORDER BY name ASC 
          ) ss
        ) as specialized_skills,
        (
          SELECT json_agg(
            json_build_object(
              ''id'', ex.id,
              ''company_name'', ex.company_name,
              ''designation'', ex.designation,
              ''start_date'', ex.start_date,
              ''end_date'', ex.end_date,
              ''is_current'', ex.is_current
            )
            ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
          )
          FROM (
            SELECT * FROM experiences WHERE profile_id = p.id 
            ORDER BY is_current DESC NULLS LAST, start_date DESC
          ) ex
        ) as experiences,
        (
          SELECT json_agg(
            json_build_object(
              ''id'', ed.id,
              ''university'', ed.university,
              ''degree'', ed.degree,
              ''department'', ed.department,
              ''end_date'', ed.end_date
            )
            ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
          )
          FROM (
            SELECT * FROM education WHERE profile_id = p.id 
            ORDER BY is_current DESC NULLS LAST, start_date DESC
          ) ed
        ) as education,
        (
          SELECT json_agg(
            json_build_object(
              ''id'', tr.id,
              ''title'', tr.title,
              ''provider'', tr.provider,
              ''certification_date'', tr.certification_date
            )
            ORDER BY tr.certification_date DESC
          )
          FROM (
            SELECT * FROM trainings WHERE profile_id = p.id 
            ORDER BY certification_date DESC
          ) tr
        ) as trainings ' || base_query || '
      ORDER BY
        CASE WHEN ''' || sort_by || ''' = ''first_name'' AND ''' || sort_order || ''' = ''asc'' THEN COALESCE(gi.first_name, p.first_name) END ASC,
        CASE WHEN ''' || sort_by || ''' = ''first_name'' AND ''' || sort_order || ''' = ''desc'' THEN COALESCE(gi.first_name, p.first_name) END DESC,
        CASE WHEN ''' || sort_by || ''' = ''last_name'' AND ''' || sort_order || ''' = ''asc'' THEN COALESCE(gi.last_name, p.last_name) END ASC,
        CASE WHEN ''' || sort_by || ''' = ''last_name'' AND ''' || sort_order || ''' = ''desc'' THEN COALESCE(gi.last_name, p.last_name) END DESC,
        CASE WHEN ''' || sort_by || ''' = ''employee_id'' AND ''' || sort_order || ''' = ''asc'' THEN p.employee_id END ASC,
        CASE WHEN ''' || sort_by || ''' = ''employee_id'' AND ''' || sort_order || ''' = ''desc'' THEN p.employee_id END DESC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_percentage'' AND ''' || sort_order || ''' = ''asc'' THEN rav.cumulative_engagement_percent END ASC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_percentage'' AND ''' || sort_order || ''' = ''desc'' THEN rav.cumulative_engagement_percent END DESC,
        CASE WHEN ''' || sort_by || ''' = ''billing_percentage'' AND ''' || sort_order || ''' = ''asc'' THEN rav.cumulative_billing_percent END ASC,
        CASE WHEN ''' || sort_by || ''' = ''billing_percentage'' AND ''' || sort_order || ''' = ''desc'' THEN rav.cumulative_billing_percent END DESC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''asc'' THEN rav.final_release_date END ASC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''desc'' THEN rav.final_release_date END DESC,
        CASE WHEN ''' || sort_by || ''' = ''availability_status'' AND ''' || sort_order || ''' = ''asc'' THEN rav.availability_status END ASC,
        CASE WHEN ''' || sort_by || ''' = ''availability_status'' AND ''' || sort_order || ''' = ''desc'' THEN rav.availability_status END DESC,
        COALESCE(gi.last_name, p.last_name) ASC
      LIMIT ' || items_per_page || '
      OFFSET ' || (page_number - 1) * items_per_page || '
    ) AS profile_data';
  
  -- Execute the final query
  EXECUTE final_query INTO profiles_array;
  
  -- Build final result
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
