
-- Update get_planned_resource_data function to use proper ID comparisons
CREATE OR REPLACE FUNCTION public.get_planned_resource_data(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter uuid DEFAULT NULL,
  manager_filter uuid DEFAULT NULL,
  bill_type_filter uuid DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage real DEFAULT NULL,
  max_engagement_percentage real DEFAULT NULL,
  min_billing_percentage real DEFAULT NULL,
  max_billing_percentage real DEFAULT NULL,
  start_date_from date DEFAULT NULL,
  start_date_to date DEFAULT NULL,
  end_date_from date DEFAULT NULL,
  end_date_to date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resource_data json;
  total_count integer;
  filtered_count integer;
  resource_array json;
BEGIN
  -- Get total count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id;
  
  -- Count filtered results with optimized filters
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  WHERE (
    search_query IS NULL 
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR CONCAT(gi.first_name, ' ', gi.last_name) ILIKE '%' || search_query || '%'
  )
  -- Optimized ID-based filters using direct equality
  AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  AND (manager_filter IS NULL OR p.manager = manager_filter)
  AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
  -- Text-based filters that should use ILIKE
  AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
  -- Numeric range filters
  AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
  AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
  AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
  AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
  -- Date range filters
  AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from)
  AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to)
  AND (end_date_from IS NULL OR rp.release_date >= end_date_from)
  AND (end_date_to IS NULL OR rp.release_date <= end_date_to);
  
  -- Get paginated results with optimized filters
  SELECT json_agg(
    json_build_object(
      'id', rp.id,
      'profile_id', rp.profile_id,
      'employee_id', p.employee_id,
      'first_name', gi.first_name,
      'last_name', gi.last_name,
      'sbu', json_build_object('id', s.id, 'name', s.name),
      'manager', json_build_object('id', mgr_profile.id, 'first_name', mgr_gi.first_name, 'last_name', mgr_gi.last_name),
      'project', CASE WHEN pm.id IS NOT NULL THEN json_build_object('id', pm.id, 'project_name', pm.project_name) ELSE NULL END,
      'bill_type', CASE WHEN bt.id IS NOT NULL THEN json_build_object('id', bt.id, 'name', bt.name) ELSE NULL END,
      'engagement_percentage', rp.engagement_percentage,
      'billing_percentage', rp.billing_percentage,
      'engagement_start_date', rp.engagement_start_date,
      'release_date', rp.release_date,
      'engagement_complete', rp.engagement_complete,
      'weekly_validation', rp.weekly_validation,
      'created_at', rp.created_at,
      'updated_at', rp.updated_at
    )
  )
  INTO resource_array
  FROM (
    SELECT *
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN profiles mgr_profile ON p.manager = mgr_profile.id
    LEFT JOIN general_information mgr_gi ON mgr_profile.id = mgr_gi.profile_id
    WHERE (
      search_query IS NULL 
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR CONCAT(gi.first_name, ' ', gi.last_name) ILIKE '%' || search_query || '%'
    )
    -- Optimized ID-based filters using direct equality
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR p.manager = manager_filter)
    AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
    -- Text-based filters that should use ILIKE
    AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
    -- Numeric range filters
    AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
    -- Date range filters
    AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from)
    AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to)
    AND (end_date_from IS NULL OR rp.release_date >= end_date_from)
    AND (end_date_to IS NULL OR rp.release_date <= end_date_to)
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN gi.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN gi.first_name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      rp.created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) ranked_results
  LEFT JOIN profiles p ON ranked_results.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN projects_management pm ON ranked_results.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN bill_types bt ON ranked_results.bill_type_id = bt.id
  LEFT JOIN profiles mgr_profile ON p.manager = mgr_profile.id
  LEFT JOIN general_information mgr_gi ON mgr_profile.id = mgr_gi.profile_id;
  
  -- Build final response
  resource_data := json_build_object(
    'resource_planning', COALESCE(resource_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  );
  
  RETURN resource_data;
END;
$$;

-- Update get_weekly_validation_data function to use proper ID comparisons
CREATE OR REPLACE FUNCTION public.get_weekly_validation_data(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter uuid DEFAULT NULL,
  manager_filter uuid DEFAULT NULL,
  bill_type_filter uuid DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage real DEFAULT NULL,
  max_engagement_percentage real DEFAULT NULL,
  min_billing_percentage real DEFAULT NULL,
  max_billing_percentage real DEFAULT NULL,
  start_date_from date DEFAULT NULL,
  start_date_to date DEFAULT NULL,
  end_date_from date DEFAULT NULL,
  end_date_to date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resource_data json;
  total_count integer;
  filtered_count integer;
  resource_array json;
BEGIN
  -- Get total count (unfiltered) - only records that need weekly validation
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  WHERE rp.weekly_validation = false;
  
  -- Count filtered results with optimized filters - only records that need weekly validation
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  WHERE rp.weekly_validation = false
  AND (
    search_query IS NULL 
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR CONCAT(gi.first_name, ' ', gi.last_name) ILIKE '%' || search_query || '%'
  )
  -- Optimized ID-based filters using direct equality
  AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  AND (manager_filter IS NULL OR p.manager = manager_filter)
  AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
  -- Text-based filters that should use ILIKE
  AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
  -- Numeric range filters
  AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
  AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
  AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
  AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
  -- Date range filters
  AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from)
  AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to)
  AND (end_date_from IS NULL OR rp.release_date >= end_date_from)
  AND (end_date_to IS NULL OR rp.release_date <= end_date_to);
  
  -- Get paginated results with optimized filters - only records that need weekly validation
  SELECT json_agg(
    json_build_object(
      'id', rp.id,
      'profile_id', rp.profile_id,
      'employee_id', p.employee_id,
      'first_name', gi.first_name,
      'last_name', gi.last_name,
      'sbu', json_build_object('id', s.id, 'name', s.name),
      'manager', json_build_object('id', mgr_profile.id, 'first_name', mgr_gi.first_name, 'last_name', mgr_gi.last_name),
      'project', CASE WHEN pm.id IS NOT NULL THEN json_build_object('id', pm.id, 'project_name', pm.project_name) ELSE NULL END,
      'bill_type', CASE WHEN bt.id IS NOT NULL THEN json_build_object('id', bt.id, 'name', bt.name) ELSE NULL END,
      'engagement_percentage', rp.engagement_percentage,
      'billing_percentage', rp.billing_percentage,
      'engagement_start_date', rp.engagement_start_date,
      'release_date', rp.release_date,
      'engagement_complete', rp.engagement_complete,
      'weekly_validation', rp.weekly_validation,
      'created_at', rp.created_at,
      'updated_at', rp.updated_at
    )
  )
  INTO resource_array
  FROM (
    SELECT *
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN profiles mgr_profile ON p.manager = mgr_profile.id
    LEFT JOIN general_information mgr_gi ON mgr_profile.id = mgr_gi.profile_id
    WHERE rp.weekly_validation = false
    AND (
      search_query IS NULL 
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR CONCAT(gi.first_name, ' ', gi.last_name) ILIKE '%' || search_query || '%'
    )
    -- Optimized ID-based filters using direct equality
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR p.manager = manager_filter)
    AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
    -- Text-based filters that should use ILIKE
    AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
    -- Numeric range filters
    AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
    -- Date range filters
    AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from)
    AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to)
    AND (end_date_from IS NULL OR rp.release_date >= end_date_from)
    AND (end_date_to IS NULL OR rp.release_date <= end_date_to)
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN gi.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN gi.first_name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      rp.created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) ranked_results
  LEFT JOIN profiles p ON ranked_results.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN projects_management pm ON ranked_results.project_id = pm.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN bill_types bt ON ranked_results.bill_type_id = bt.id
  LEFT JOIN profiles mgr_profile ON p.manager = mgr_profile.id
  LEFT JOIN general_information mgr_gi ON mgr_profile.id = mgr_gi.profile_id;
  
  -- Build final response
  resource_data := json_build_object(
    'resource_planning', COALESCE(resource_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  );
  
  RETURN resource_data;
END;
$$;
