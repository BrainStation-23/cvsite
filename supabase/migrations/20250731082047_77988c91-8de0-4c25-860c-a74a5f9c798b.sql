
-- Create a new RPC function specifically for unplanned resources
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  unplanned_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  unplanned_array JSON;
BEGIN
  -- Calculate total unplanned resources count (profiles without resource planning entries)
  SELECT COUNT(*)
  INTO total_count
  FROM profiles p
  LEFT JOIN resource_planning rp ON p.id = rp.profile_id
  WHERE rp.profile_id IS NULL;
  
  -- Count filtered unplanned results
  SELECT COUNT(DISTINCT p.id)
  INTO filtered_count
  FROM profiles p
  LEFT JOIN resource_planning rp ON p.id = rp.profile_id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles pm ON p.manager = pm.id
  LEFT JOIN general_information gim ON pm.id = gim.profile_id
  WHERE rp.profile_id IS NULL
    AND (
      search_query IS NULL 
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR gi.current_designation ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
    AND (manager_filter IS NULL OR 
         COALESCE(gim.first_name, pm.first_name) || ' ' || COALESCE(gim.last_name, pm.last_name) ILIKE '%' || manager_filter || '%');

  -- Build unplanned resources query with proper sorting and pagination
  SELECT json_agg(row_to_json(unplanned_resource))
  INTO unplanned_array
  FROM (
    SELECT 
      p.id,
      p.id as profile_id,
      p.employee_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      COALESCE(gi.current_designation, 'N/A') as current_designation,
      p.created_at,
      p.updated_at,
      json_build_object(
        'id', p.id,
        'employee_id', p.employee_id,
        'first_name', COALESCE(gi.first_name, p.first_name),
        'last_name', COALESCE(gi.last_name, p.last_name),
        'current_designation', COALESCE(gi.current_designation, 'N/A')
      ) as profile
    FROM profiles p
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles pm ON p.manager = pm.id
    LEFT JOIN general_information gim ON pm.id = gim.profile_id
    WHERE rp.profile_id IS NULL
      AND (
        search_query IS NULL 
        OR p.first_name ILIKE '%' || search_query || '%'
        OR p.last_name ILIKE '%' || search_query || '%'
        OR p.employee_id ILIKE '%' || search_query || '%'
        OR gi.first_name ILIKE '%' || search_query || '%'
        OR gi.last_name ILIKE '%' || search_query || '%'
        OR gi.current_designation ILIKE '%' || search_query || '%'
      )
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (manager_filter IS NULL OR 
           COALESCE(gim.first_name, pm.first_name) || ' ' || COALESCE(gim.last_name, pm.last_name) ILIKE '%' || manager_filter || '%')
    ORDER BY
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name) END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name) END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN COALESCE(gi.last_name, p.last_name) END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN COALESCE(gi.last_name, p.last_name) END DESC,
      CASE WHEN sort_by = 'current_designation' AND sort_order = 'asc' THEN COALESCE(gi.current_designation, 'N/A') END ASC,
      CASE WHEN sort_by = 'current_designation' AND sort_order = 'desc' THEN COALESCE(gi.current_designation, 'N/A') END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      p.created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) unplanned_resource;

  -- Build final result JSON
  SELECT json_build_object(
    'unplanned_resources', COALESCE(unplanned_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO unplanned_data;
  
  RETURN unplanned_data;
END;
$function$;
