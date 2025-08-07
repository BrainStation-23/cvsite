
-- Drop the existing comprehensive function first
DROP FUNCTION IF EXISTS public.get_comprehensive_resource_planning_data;

-- Create RPC function for planned resources tab
CREATE OR REPLACE FUNCTION public.get_planned_resource_data(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage real DEFAULT NULL,
  max_engagement_percentage real DEFAULT NULL,
  min_billing_percentage real DEFAULT NULL,
  max_billing_percentage real DEFAULT NULL,
  start_date_from text DEFAULT NULL,
  start_date_to text DEFAULT NULL,
  end_date_from text DEFAULT NULL,
  end_date_to text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  offset_value integer;
BEGIN
  offset_value := (page_number - 1) * items_per_page;
  
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  WHERE (rp.bill_type_id IS NOT NULL OR rp.project_id IS NOT NULL);
  
  WITH filtered_data AS (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.bill_type_id,
      rp.project_id,
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
        'first_name', COALESCE(gi.first_name, p.first_name),
        'last_name', COALESCE(gi.last_name, p.last_name),
        'current_designation', gi.current_designation
      ) as profile,
      
      CASE 
        WHEN bt.id IS NOT NULL THEN 
          json_build_object('id', bt.id, 'name', bt.name)
        ELSE NULL
      END as bill_type,
      
      CASE 
        WHEN pm.id IS NOT NULL THEN 
          json_build_object(
            'id', pm.id,
            'project_name', pm.project_name,
            'project_manager', pm.project_manager,
            'client_name', pm.client_name,
            'budget', pm.budget
          )
        ELSE NULL
      END as project,
      
      s.name as sbu_name,
      COALESCE(gi_mgr.first_name, p_mgr.first_name) || ' ' || 
      COALESCE(gi_mgr.last_name, p_mgr.last_name) as manager_name
      
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles p_mgr ON p.manager = p_mgr.id
    LEFT JOIN general_information gi_mgr ON p_mgr.id = gi_mgr.profile_id
    
    WHERE (rp.bill_type_id IS NOT NULL OR rp.project_id IS NOT NULL)
      AND (
        search_query IS NULL 
        OR COALESCE(gi.first_name, p.first_name) ILIKE '%' || search_query || '%'
        OR COALESCE(gi.last_name, p.last_name) ILIKE '%' || search_query || '%'
        OR p.employee_id ILIKE '%' || search_query || '%'
        OR pm.project_name ILIKE '%' || search_query || '%'
        OR pm.client_name ILIKE '%' || search_query || '%'
        OR bt.name ILIKE '%' || search_query || '%'
      )
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (
        manager_filter IS NULL 
        OR (
          COALESCE(gi_mgr.first_name, p_mgr.first_name) || ' ' || 
          COALESCE(gi_mgr.last_name, p_mgr.last_name)
        ) ILIKE '%' || manager_filter || '%'
      )
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (
        project_search IS NULL 
        OR pm.project_name ILIKE '%' || project_search || '%'
        OR pm.client_name ILIKE '%' || project_search || '%'
      )
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  ),
  
  count_data AS (
    SELECT COUNT(*) as filtered_count FROM filtered_data
  ),
  
  paginated_data AS (
    SELECT *
    FROM filtered_data
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'asc' THEN updated_at END ASC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'desc' THEN updated_at END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      created_at DESC
    LIMIT items_per_page
    OFFSET offset_value
  )
  
  SELECT 
    json_build_object(
      'resource_planning', COALESCE(array_to_json(array_agg(row_to_json(pd))), '[]'::json),
      'pagination', json_build_object(
        'total_count', total_count,
        'filtered_count', cd.filtered_count,
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL(cd.filtered_count::numeric / items_per_page)
      )
    )
  INTO result_data
  FROM paginated_data pd
  CROSS JOIN count_data cd;
  
  RETURN COALESCE(result_data, json_build_object(
    'resource_planning', '[]'::json,
    'pagination', json_build_object(
      'total_count', 0,
      'filtered_count', 0,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', 0
    )
  ));
END;
$$;

-- Create RPC function for weekly validation tab  
CREATE OR REPLACE FUNCTION public.get_weekly_validation_data(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  sbu_filter text DEFAULT NULL,
  manager_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  project_search text DEFAULT NULL,
  min_engagement_percentage real DEFAULT NULL,
  max_engagement_percentage real DEFAULT NULL,
  min_billing_percentage real DEFAULT NULL,
  max_billing_percentage real DEFAULT NULL,
  start_date_from text DEFAULT NULL,
  start_date_to text DEFAULT NULL,
  end_date_from text DEFAULT NULL,
  end_date_to text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  offset_value integer;
BEGIN
  offset_value := (page_number - 1) * items_per_page;
  
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  WHERE (rp.weekly_validation IS NULL OR rp.weekly_validation = false);
  
  WITH filtered_data AS (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.bill_type_id,
      rp.project_id,
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
        'first_name', COALESCE(gi.first_name, p.first_name),
        'last_name', COALESCE(gi.last_name, p.last_name),
        'current_designation', gi.current_designation
      ) as profile,
      
      CASE 
        WHEN bt.id IS NOT NULL THEN 
          json_build_object('id', bt.id, 'name', bt.name)
        ELSE NULL
      END as bill_type,
      
      CASE 
        WHEN pm.id IS NOT NULL THEN 
          json_build_object(
            'id', pm.id,
            'project_name', pm.project_name,
            'project_manager', pm.project_manager,
            'client_name', pm.client_name,
            'budget', pm.budget
          )
        ELSE NULL
      END as project,
      
      s.name as sbu_name,
      COALESCE(gi_mgr.first_name, p_mgr.first_name) || ' ' || 
      COALESCE(gi_mgr.last_name, p_mgr.last_name) as manager_name
      
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles p_mgr ON p.manager = p_mgr.id
    LEFT JOIN general_information gi_mgr ON p_mgr.id = gi_mgr.profile_id
    
    WHERE (rp.weekly_validation IS NULL OR rp.weekly_validation = false)
      AND (
        search_query IS NULL 
        OR COALESCE(gi.first_name, p.first_name) ILIKE '%' || search_query || '%'
        OR COALESCE(gi.last_name, p.last_name) ILIKE '%' || search_query || '%'
        OR p.employee_id ILIKE '%' || search_query || '%'
        OR pm.project_name ILIKE '%' || search_query || '%'
        OR pm.client_name ILIKE '%' || search_query || '%'
        OR bt.name ILIKE '%' || search_query || '%'
      )
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (
        manager_filter IS NULL 
        OR (
          COALESCE(gi_mgr.first_name, p_mgr.first_name) || ' ' || 
          COALESCE(gi_mgr.last_name, p_mgr.last_name)
        ) ILIKE '%' || manager_filter || '%'
      )
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (
        project_search IS NULL 
        OR pm.project_name ILIKE '%' || project_search || '%'
        OR pm.client_name ILIKE '%' || project_search || '%'
      )
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  ),
  
  count_data AS (
    SELECT COUNT(*) as filtered_count FROM filtered_data
  ),
  
  paginated_data AS (
    SELECT *
    FROM filtered_data
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'asc' THEN updated_at END ASC,
      CASE WHEN sort_by = 'updated_at' AND sort_order = 'desc' THEN updated_at END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      created_at DESC
    LIMIT items_per_page
    OFFSET offset_value
  )
  
  SELECT 
    json_build_object(
      'resource_planning', COALESCE(array_to_json(array_agg(row_to_json(pd))), '[]'::json),
      'pagination', json_build_object(
        'total_count', total_count,
        'filtered_count', cd.filtered_count,
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL(cd.filtered_count::numeric / items_per_page)
      )
    )
  INTO result_data
  FROM paginated_data pd
  CROSS JOIN count_data cd;
  
  RETURN COALESCE(result_data, json_build_object(
    'resource_planning', '[]'::json,
    'pagination', json_build_object(
      'total_count', 0,
      'filtered_count', 0,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', 0
    )
  ));
END;
$$;
