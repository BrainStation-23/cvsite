
-- Update the get_resource_planning_data function to support SBU and Manager filters
CREATE OR REPLACE FUNCTION public.get_resource_planning_data(
  search_query text DEFAULT NULL::text, 
  page_number integer DEFAULT 1, 
  items_per_page integer DEFAULT 10, 
  sort_by text DEFAULT 'created_at'::text, 
  sort_order text DEFAULT 'desc'::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  resource_planning_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  resource_planning_array JSON;
BEGIN
  -- Calculate total resource planning records count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp;
  
  -- Count filtered results
  SELECT COUNT(DISTINCT rp.id)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles manager_profile ON p.manager = manager_profile.id
  WHERE (
    search_query IS NULL
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR bt.name ILIKE '%' || search_query || '%'
    OR pm.project_name ILIKE '%' || search_query || '%'
    OR pm.client_name ILIKE '%' || search_query || '%'
    OR pm.project_manager ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR p.sbu_id::text = sbu_filter)
  AND (manager_filter IS NULL OR p.manager::text = manager_filter);
  
  -- Build resource planning query with proper sorting and pagination
  SELECT json_agg(row_to_json(rp_data))
  INTO resource_planning_array
  FROM (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.release_date,
      rp.engagement_start_date,
      rp.created_at,
      rp.updated_at,
      -- Profile information
      json_build_object(
        'id', p.id,
        'employee_id', p.employee_id,
        'first_name', COALESCE(gi.first_name, p.first_name),
        'last_name', COALESCE(gi.last_name, p.last_name),
        'current_designation', gi.current_designation
      ) as profile,
      -- Bill type information
      CASE 
        WHEN bt.id IS NOT NULL THEN json_build_object(
          'id', bt.id,
          'name', bt.name
        )
        ELSE NULL
      END as bill_type,
      -- Project information
      CASE 
        WHEN pm.id IS NOT NULL THEN json_build_object(
          'id', pm.id,
          'project_name', pm.project_name,
          'project_manager', pm.project_manager,
          'client_name', pm.client_name,
          'budget', pm.budget
        )
        ELSE NULL
      END as project
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles manager_profile ON p.manager = manager_profile.id
    WHERE (
      search_query IS NULL
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR bt.name ILIKE '%' || search_query || '%'
      OR pm.project_name ILIKE '%' || search_query || '%'
      OR pm.client_name ILIKE '%' || search_query || '%'
      OR pm.project_manager ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR p.sbu_id::text = sbu_filter)
    AND (manager_filter IS NULL OR p.manager::text = manager_filter)
    ORDER BY
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name) END ASC,
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name) END DESC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN pm.project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN pm.project_name END DESC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'asc' THEN bt.name END ASC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'desc' THEN bt.name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'asc' THEN rp.engagement_start_date END ASC,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'desc' THEN rp.engagement_start_date END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN rp.release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN rp.release_date END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('profile_name', 'project_name', 'bill_type', 'engagement_percentage', 'engagement_start_date', 'release_date', 'created_at')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN rp.created_at END DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) AS rp_data;
  
  -- Build final result JSON
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO resource_planning_data;
  
  RETURN resource_planning_data;
END;
$function$
