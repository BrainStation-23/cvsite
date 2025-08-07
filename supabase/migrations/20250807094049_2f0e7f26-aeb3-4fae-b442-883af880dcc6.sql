
-- Update the get_comprehensive_resource_planning_data function to add weekly_validation_filter parameter
CREATE OR REPLACE FUNCTION public.get_comprehensive_resource_planning_data(
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
  end_date_to text DEFAULT NULL,
  include_unplanned boolean DEFAULT false,
  include_weekly_validation boolean DEFAULT false,
  weekly_validation_filter text DEFAULT 'all' -- New parameter: 'all', 'pending', 'completed'
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
  -- Calculate offset
  offset_value := (page_number - 1) * items_per_page;
  
  -- Get total count (all resource planning records)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp;
  
  -- Build the main query with all filters including weekly_validation_filter
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
        WHEN bt.id IS NOT NULL THEN 
          json_build_object(
            'id', bt.id,
            'name', bt.name
          )
        ELSE NULL
      END as bill_type,
      
      -- Project information
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
      
      -- SBU information for filtering
      s.name as sbu_name,
      
      -- Manager information for filtering
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
    
    WHERE 1=1
      -- Search query filter
      AND (
        search_query IS NULL 
        OR COALESCE(gi.first_name, p.first_name) ILIKE '%' || search_query || '%'
        OR COALESCE(gi.last_name, p.last_name) ILIKE '%' || search_query || '%'
        OR p.employee_id ILIKE '%' || search_query || '%'
        OR pm.project_name ILIKE '%' || search_query || '%'
        OR pm.client_name ILIKE '%' || search_query || '%'
        OR bt.name ILIKE '%' || search_query || '%'
      )
      
      -- SBU filter
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      
      -- Manager filter
      AND (
        manager_filter IS NULL 
        OR (
          COALESCE(gi_mgr.first_name, p_mgr.first_name) || ' ' || 
          COALESCE(gi_mgr.last_name, p_mgr.last_name)
        ) ILIKE '%' || manager_filter || '%'
      )
      
      -- Bill type filter
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      
      -- Project search filter
      AND (
        project_search IS NULL 
        OR pm.project_name ILIKE '%' || project_search || '%'
        OR pm.client_name ILIKE '%' || project_search || '%'
      )
      
      -- Engagement percentage filters
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      
      -- Billing percentage filters
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      
      -- Start date filters
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      
      -- End date filters  
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
      
      -- Unplanned filter
      AND (
        include_unplanned = true 
        OR (rp.bill_type_id IS NOT NULL OR rp.project_id IS NOT NULL)
      )
      
      -- Weekly validation filter - NEW LOGIC
      AND (
        weekly_validation_filter = 'all' 
        OR (weekly_validation_filter = 'pending' AND (rp.weekly_validation IS NULL OR rp.weekly_validation = false))
        OR (weekly_validation_filter = 'completed' AND rp.weekly_validation = true)
      )
  ),
  
  -- Get filtered count
  count_data AS (
    SELECT COUNT(*) as filtered_count
    FROM filtered_data
  ),
  
  -- Get paginated results with sorting
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
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN release_date END DESC,
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
