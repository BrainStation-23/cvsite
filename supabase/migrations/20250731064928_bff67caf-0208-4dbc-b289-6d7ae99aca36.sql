
-- Create the get_planned_resources RPC function
CREATE OR REPLACE FUNCTION public.get_planned_resources(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage integer DEFAULT NULL,
  max_engagement_percentage integer DEFAULT NULL,
  min_billing_percentage integer DEFAULT NULL,
  max_billing_percentage integer DEFAULT NULL,
  start_date_from text DEFAULT NULL,
  start_date_to text DEFAULT NULL,
  end_date_from text DEFAULT NULL,
  end_date_to text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  resource_planning_array json;
BEGIN
  -- Get total count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects proj ON rp.project_id = proj.id;

  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects proj ON rp.project_id = proj.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE (
    search_query IS NULL 
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR p.current_designation ILIKE '%' || search_query || '%'
    OR proj.project_name ILIKE '%' || search_query || '%'
    OR proj.client_name ILIKE '%' || search_query || '%'
    OR bt.name ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
  AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%')
  AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
  AND (project_search IS NULL OR proj.project_name ILIKE '%' || project_search || '%')
  AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
  AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
  AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
  AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
  AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
  AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
  AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
  AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date);

  -- Build the main query
  SELECT json_agg(row_to_json(resource_data))
  INTO resource_planning_array
  FROM (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.release_date,
      rp.engagement_start_date,
      rp.engagement_complete,
      rp.created_at,
      rp.updated_at,
      json_build_object(
        'id', p.id,
        'employee_id', p.employee_id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'current_designation', p.current_designation
      ) as profile,
      CASE WHEN bt.id IS NOT NULL THEN
        json_build_object(
          'id', bt.id,
          'name', bt.name
        )
      ELSE NULL END as bill_type,
      CASE WHEN proj.id IS NOT NULL THEN
        json_build_object(
          'id', proj.id,
          'project_name', proj.project_name,
          'project_manager', proj.project_manager,
          'client_name', proj.client_name,
          'budget', proj.budget
        )
      ELSE NULL END as project
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects proj ON rp.project_id = proj.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE (
      search_query IS NULL 
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR p.current_designation ILIKE '%' || search_query || '%'
      OR proj.project_name ILIKE '%' || search_query || '%'
      OR proj.client_name ILIKE '%' || search_query || '%'
      OR bt.name ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
    AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%')
    AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
    AND (project_search IS NULL OR proj.project_name ILIKE '%' || project_search || '%')
    AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
    AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
    AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
    AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
    AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      rp.created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) resource_data;

  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO result_data;
  
  RETURN result_data;
END;
$function$;

-- Create the get_unplanned_resources RPC function
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 100,
  sort_by text DEFAULT 'first_name',
  sort_order text DEFAULT 'asc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  unplanned_array json;
BEGIN
  -- Get total count of profiles without resource planning
  SELECT COUNT(*)
  INTO total_count
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
  );

  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM profiles p
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE NOT EXISTS (
    SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
  )
  AND (
    search_query IS NULL 
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR p.current_designation ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
  AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%');

  -- Build the main query
  SELECT json_agg(row_to_json(profile_data))
  INTO unplanned_array
  FROM (
    SELECT 
      p.id,
      p.employee_id,
      p.first_name,
      p.last_name,
      p.current_designation,
      p.email,
      p.created_at,
      p.updated_at
    FROM profiles p
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE NOT EXISTS (
      SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
    )
    AND (
      search_query IS NULL 
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR p.current_designation ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
    AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%')
    ORDER BY
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      p.first_name ASC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) profile_data;

  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(unplanned_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO result_data;
  
  RETURN result_data;
END;
$function$;

-- Create the get_weekly_validation_resources RPC function
CREATE OR REPLACE FUNCTION public.get_weekly_validation_resources(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 100,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage integer DEFAULT NULL,
  max_engagement_percentage integer DEFAULT NULL,
  min_billing_percentage integer DEFAULT NULL,
  max_billing_percentage integer DEFAULT NULL,
  start_date_from text DEFAULT NULL,
  start_date_to text DEFAULT NULL,
  end_date_from text DEFAULT NULL,
  end_date_to text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  resource_planning_array json;
BEGIN
  -- Get total count of resource planning entries needing validation
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects proj ON rp.project_id = proj.id
  WHERE rp.weekly_validation = false OR rp.weekly_validation IS NULL;

  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN projects proj ON rp.project_id = proj.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE (rp.weekly_validation = false OR rp.weekly_validation IS NULL)
  AND (
    search_query IS NULL 
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR p.current_designation ILIKE '%' || search_query || '%'
    OR proj.project_name ILIKE '%' || search_query || '%'
    OR proj.client_name ILIKE '%' || search_query || '%'
    OR bt.name ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
  AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%')
  AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
  AND (project_search IS NULL OR proj.project_name ILIKE '%' || project_search || '%')
  AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
  AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
  AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
  AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
  AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
  AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
  AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
  AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date);

  -- Build the main query
  SELECT json_agg(row_to_json(resource_data))
  INTO resource_planning_array
  FROM (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.release_date,
      rp.engagement_start_date,
      rp.engagement_complete,
      rp.weekly_validation,
      rp.created_at,
      rp.updated_at,
      json_build_object(
        'id', p.id,
        'employee_id', p.employee_id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'current_designation', p.current_designation
      ) as profile,
      CASE WHEN bt.id IS NOT NULL THEN
        json_build_object(
          'id', bt.id,
          'name', bt.name
        )
      ELSE NULL END as bill_type,
      CASE WHEN proj.id IS NOT NULL THEN
        json_build_object(
          'id', proj.id,
          'project_name', proj.project_name,
          'project_manager', proj.project_manager,
          'client_name', proj.client_name,
          'budget', proj.budget
        )
      ELSE NULL END as project
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects proj ON rp.project_id = proj.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE (rp.weekly_validation = false OR rp.weekly_validation IS NULL)
    AND (
      search_query IS NULL 
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR p.current_designation ILIKE '%' || search_query || '%'
      OR proj.project_name ILIKE '%' || search_query || '%'
      OR proj.client_name ILIKE '%' || search_query || '%'
      OR bt.name ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
    AND (manager_filter IS NULL OR p.manager ILIKE '%' || manager_filter || '%')
    AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
    AND (project_search IS NULL OR proj.project_name ILIKE '%' || project_search || '%')
    AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
    AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
    AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
    AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
    AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
      rp.created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) resource_data;

  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  ) INTO result_data;
  
  RETURN result_data;
END;
$function$;
