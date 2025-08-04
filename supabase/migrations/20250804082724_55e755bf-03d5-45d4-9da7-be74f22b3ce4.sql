
-- Create employee search index materialized view
CREATE MATERIALIZED VIEW public.employee_search_index AS
SELECT 
  p.id as profile_id,
  p.employee_id,
  COALESCE(gi.first_name, p.first_name) as first_name,
  COALESCE(gi.last_name, p.last_name) as last_name,
  gi.current_designation,
  gi.biography,
  s.name as sbu_name,
  et.name as expertise_type,
  rt.name as resource_type,
  
  -- Aggregated search content
  setweight(to_tsvector('english', 
    COALESCE(gi.first_name, p.first_name, '') || ' ' || 
    COALESCE(gi.last_name, p.last_name, '') || ' ' ||
    COALESCE(p.employee_id, '') || ' ' ||
    COALESCE(gi.current_designation, '') || ' ' ||
    COALESCE(gi.biography, '')
  ), 'A') ||
  
  -- Technical and specialized skills (high weight)
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(ts.name, ' ')
      FROM technical_skills ts 
      WHERE ts.profile_id = p.id
    ), '')
  ), 'A') ||
  
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(ss.name, ' ')
      FROM specialized_skills ss 
      WHERE ss.profile_id = p.id
    ), '')
  ), 'A') ||
  
  -- Experience content (medium weight)
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(ex.company_name || ' ' || COALESCE(ex.designation, '') || ' ' || COALESCE(ex.description, ''), ' ')
      FROM experiences ex 
      WHERE ex.profile_id = p.id
    ), '')
  ), 'B') ||
  
  -- Education content (medium weight)
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(ed.university || ' ' || COALESCE(ed.degree, '') || ' ' || COALESCE(ed.department, ''), ' ')
      FROM education ed 
      WHERE ed.profile_id = p.id
    ), '')
  ), 'B') ||
  
  -- Projects content (medium weight)
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(pr.name || ' ' || COALESCE(pr.role, '') || ' ' || COALESCE(pr.description, '') || ' ' || 
                       COALESCE(array_to_string(pr.technologies_used, ' '), ''), ' ')
      FROM projects pr 
      WHERE pr.profile_id = p.id
    ), '')
  ), 'B') ||
  
  -- Trainings and achievements (lower weight)
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(tr.title || ' ' || COALESCE(tr.provider, '') || ' ' || COALESCE(tr.description, ''), ' ')
      FROM trainings tr 
      WHERE tr.profile_id = p.id
    ), '')
  ), 'C') ||
  
  setweight(to_tsvector('english', 
    COALESCE((
      SELECT string_agg(ac.title || ' ' || COALESCE(ac.description, ''), ' ')
      FROM achievements ac 
      WHERE ac.profile_id = p.id
    ), '')
  ), 'C') as search_vector,
  
  -- Calculate total experience in years
  COALESCE((
    SELECT ROUND(
      SUM(
        CASE 
          WHEN ex.is_current THEN 
            EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
          ELSE 
            EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
        END
      )::numeric, 1
    )
    FROM experiences ex 
    WHERE ex.profile_id = p.id AND ex.start_date IS NOT NULL
  ), 0) as total_experience_years,
  
  -- Resource planning data for availability filtering
  rp.engagement_percentage,
  rp.billing_percentage,
  rp.release_date,
  rp.engagement_complete,
  pm.project_name as current_project,
  
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN general_information gi ON p.id = gi.profile_id
LEFT JOIN sbus s ON p.sbu_id = s.id
LEFT JOIN expertise_types et ON p.expertise = et.id
LEFT JOIN resource_types rt ON p.resource_type = rt.id
LEFT JOIN resource_planning rp ON p.id = rp.profile_id AND rp.engagement_complete = false
LEFT JOIN projects_management pm ON rp.project_id = pm.id;

-- Create GIN index for fast full-text search
CREATE INDEX idx_employee_search_vector ON public.employee_search_index USING gin(search_vector);

-- Create additional indexes for filtering
CREATE INDEX idx_employee_search_experience ON public.employee_search_index (total_experience_years);
CREATE INDEX idx_employee_search_availability ON public.employee_search_index (engagement_complete, release_date);
CREATE INDEX idx_employee_search_sbu ON public.employee_search_index (sbu_name);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_employee_search_index()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.employee_search_index;
END;
$$;

-- Create the new search function
CREATE OR REPLACE FUNCTION public.search_employees(
  search_query text DEFAULT NULL,
  min_experience_years integer DEFAULT NULL,
  max_experience_years integer DEFAULT NULL,
  availability_filter text DEFAULT NULL,
  sbu_filter text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'relevance',
  sort_order text DEFAULT 'desc'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_results json;
  total_count integer;
  filtered_count integer;
  results_array json;
  ts_query tsquery;
BEGIN
  -- Convert search query to tsquery if provided
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    BEGIN
      -- Try to create a proper tsquery, fall back to plainto_tsquery if parsing fails
      ts_query := websearch_to_tsquery('english', search_query);
    EXCEPTION WHEN OTHERS THEN
      ts_query := plainto_tsquery('english', search_query);
    END;
  END IF;
  
  -- Get total count (unfiltered)
  SELECT COUNT(*) INTO total_count FROM employee_search_index;
  
  -- Get filtered count
  SELECT COUNT(*)
  INTO filtered_count
  FROM employee_search_index esi
  WHERE (
    search_query IS NULL 
    OR trim(search_query) = '' 
    OR esi.search_vector @@ ts_query
  )
  AND (min_experience_years IS NULL OR esi.total_experience_years >= min_experience_years)
  AND (max_experience_years IS NULL OR esi.total_experience_years <= max_experience_years)
  AND (
    availability_filter IS NULL 
    OR (availability_filter = 'available' AND (esi.engagement_complete = true OR esi.engagement_percentage IS NULL OR esi.engagement_percentage < 80))
    OR (availability_filter = 'engaged' AND esi.engagement_complete = false AND esi.engagement_percentage >= 80)
  )
  AND (sbu_filter IS NULL OR esi.sbu_name ILIKE '%' || sbu_filter || '%');
  
  -- Get paginated results with ranking
  SELECT json_agg(
    json_build_object(
      'id', esi.profile_id,
      'employee_id', esi.employee_id,
      'first_name', esi.first_name,
      'last_name', esi.last_name,
      'current_designation', esi.current_designation,
      'biography', esi.biography,
      'sbu_name', esi.sbu_name,
      'expertise_type', esi.expertise_type,
      'resource_type', esi.resource_type,
      'total_experience_years', esi.total_experience_years,
      'engagement_percentage', esi.engagement_percentage,
      'billing_percentage', esi.billing_percentage,
      'release_date', esi.release_date,
      'current_project', esi.current_project,
      'search_rank', CASE 
        WHEN search_query IS NOT NULL AND trim(search_query) != '' 
        THEN ts_rank(esi.search_vector, ts_query)
        ELSE 0 
      END
    )
  )
  INTO results_array
  FROM (
    SELECT *
    FROM employee_search_index esi
    WHERE (
      search_query IS NULL 
      OR trim(search_query) = '' 
      OR esi.search_vector @@ ts_query
    )
    AND (min_experience_years IS NULL OR esi.total_experience_years >= min_experience_years)
    AND (max_experience_years IS NULL OR esi.total_experience_years <= max_experience_years)
    AND (
      availability_filter IS NULL 
      OR (availability_filter = 'available' AND (esi.engagement_complete = true OR esi.engagement_percentage IS NULL OR esi.engagement_percentage < 80))
      OR (availability_filter = 'engaged' AND esi.engagement_complete = false AND esi.engagement_percentage >= 80)
    )
    AND (sbu_filter IS NULL OR esi.sbu_name ILIKE '%' || sbu_filter || '%')
    ORDER BY
      CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL AND trim(search_query) != '' 
           THEN ts_rank(esi.search_vector, ts_query) END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN esi.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN esi.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN esi.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN esi.last_name END DESC,
      CASE WHEN sort_by = 'experience' AND sort_order = 'asc' THEN esi.total_experience_years END ASC,
      CASE WHEN sort_by = 'experience' AND sort_order = 'desc' THEN esi.total_experience_years END DESC,
      esi.first_name ASC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) ranked_results;
  
  -- Build final response
  search_results := json_build_object(
    'profiles', COALESCE(results_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  );
  
  RETURN search_results;
END;
$$;

-- Set up automatic refresh of materialized view
-- Create a trigger function to refresh the view when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_employee_search_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use pg_notify to signal that a refresh is needed
  PERFORM pg_notify('refresh_search_index', '');
  RETURN NULL;
END;
$$;

-- Create triggers on all relevant tables
CREATE TRIGGER refresh_search_on_profiles_change
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_general_info_change
  AFTER INSERT OR UPDATE OR DELETE ON general_information
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_skills_change
  AFTER INSERT OR UPDATE OR DELETE ON technical_skills
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_specialized_skills_change
  AFTER INSERT OR UPDATE OR DELETE ON specialized_skills
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_experience_change
  AFTER INSERT OR UPDATE OR DELETE ON experiences
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_education_change
  AFTER INSERT OR UPDATE OR DELETE ON education
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_projects_change
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();

CREATE TRIGGER refresh_search_on_resource_planning_change
  AFTER INSERT OR UPDATE OR DELETE ON resource_planning
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_employee_search_index();
