
-- Drop the existing function completely
DROP FUNCTION IF EXISTS public.get_resource_planning_data(text, integer, integer, text, text, text, text);

-- Create a completely rewritten function with proper UUID handling
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
  sbu_uuid UUID;
  manager_uuid UUID;
BEGIN
  -- Convert string filters to UUIDs if they are valid UUIDs, otherwise keep as NULL
  BEGIN
    sbu_uuid := CASE WHEN sbu_filter IS NOT NULL AND sbu_filter != '' THEN sbu_filter::UUID ELSE NULL END;
  EXCEPTION
    WHEN invalid_text_representation THEN
      sbu_uuid := NULL;
  END;
  
  BEGIN
    manager_uuid := CASE WHEN manager_filter IS NOT NULL AND manager_filter != '' THEN manager_filter::UUID ELSE NULL END;
  EXCEPTION
    WHEN invalid_text_representation THEN
      manager_uuid := NULL;
  END;

  -- Calculate total resource planning records count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp;
  
  -- Count filtered results with proper UUID comparisons
  SELECT COUNT(DISTINCT rp.id)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles manager_profile ON p.manager = manager_profile.id
  LEFT JOIN general_information manager_gi ON manager_profile.id = manager_gi.profile_id
  WHERE (
    search_query IS NULL
    OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(bt.name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(pm.project_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(pm.client_name, '') ILIKE '%' || search_query || '%'
  )
  AND (sbu_uuid IS NULL OR p.sbu_id = sbu_uuid)
  AND (manager_uuid IS NULL OR p.manager = manager_uuid);
  
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
      -- Profile information with proper NULL handling
      json_build_object(
        'id', p.id,
        'employee_id', COALESCE(p.employee_id, ''),
        'first_name', COALESCE(gi.first_name, p.first_name, ''),
        'last_name', COALESCE(gi.last_name, p.last_name, ''),
        'current_designation', COALESCE(gi.current_designation, '')
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
          'project_manager', COALESCE(pm.project_manager::text, ''),
          'client_name', COALESCE(pm.client_name, ''),
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
    LEFT JOIN general_information manager_gi ON manager_profile.id = manager_gi.profile_id
    WHERE (
      search_query IS NULL
      OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(bt.name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(pm.project_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(pm.client_name, '') ILIKE '%' || search_query || '%'
    )
    AND (sbu_uuid IS NULL OR p.sbu_id = sbu_uuid)
    AND (manager_uuid IS NULL OR p.manager = manager_uuid)
    ORDER BY
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name, '') END ASC,
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name, '') END DESC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN COALESCE(pm.project_name, '') END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN COALESCE(pm.project_name, '') END DESC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'asc' THEN COALESCE(bt.name, '') END ASC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'desc' THEN COALESCE(bt.name, '') END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'asc' THEN rp.engagement_start_date END ASC,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'desc' THEN rp.engagement_start_date END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN rp.release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN rp.release_date END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      rp.created_at DESC -- Default fallback
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
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO resource_planning_data;
  
  RETURN resource_planning_data;
END;
$function$
