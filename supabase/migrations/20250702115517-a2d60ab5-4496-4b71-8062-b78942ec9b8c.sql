
-- Create RPC function for searching projects with pagination
CREATE OR REPLACE FUNCTION public.search_projects(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'project_name',
  sort_order text DEFAULT 'asc'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  projects_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  projects_array JSON;
BEGIN
  -- Calculate total projects count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM projects_management;
  
  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM projects_management p
  WHERE (
    search_query IS NULL 
    OR p.project_name ILIKE '%' || search_query || '%'
    OR p.client_name ILIKE '%' || search_query || '%'
    OR p.project_manager ILIKE '%' || search_query || '%'
  );
  
  -- Build projects query with proper sorting and pagination
  SELECT json_agg(row_to_json(p))
  INTO projects_array
  FROM (
    SELECT 
      p.id,
      p.project_name,
      p.client_name,
      p.project_manager,
      p.budget,
      p.created_at,
      p.updated_at
    FROM projects_management p
    WHERE (
      search_query IS NULL 
      OR p.project_name ILIKE '%' || search_query || '%'
      OR p.client_name ILIKE '%' || search_query || '%'
      OR p.project_manager ILIKE '%' || search_query || '%'
    )
    ORDER BY
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN p.project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN p.project_name END DESC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'asc' THEN p.client_name END ASC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'desc' THEN p.client_name END DESC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'asc' THEN p.project_manager END ASC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'desc' THEN p.project_manager END DESC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'asc' THEN p.budget END ASC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'desc' THEN p.budget END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('project_name', 'client_name', 'project_manager', 'budget', 'created_at')) 
        AND (sort_order IS NULL OR sort_order = 'asc') THEN p.project_name END ASC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) p;
  
  -- Build final result JSON
  SELECT json_build_object(
    'projects', COALESCE(projects_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO projects_data;
  
  RETURN projects_data;
END;
$$;
