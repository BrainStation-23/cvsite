
-- Rewrite get_planned_resource_data function from scratch with a clean, simple approach
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
  total_count integer;
  filtered_count integer;
  results_json json;
BEGIN
  -- Get total count of all resource planning records
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning;
  
  -- Build the main query with all joins and return as JSON
  WITH filtered_data AS (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.engagement_start_date,
      rp.release_date,
      rp.engagement_complete,
      rp.weekly_validation,
      rp.created_at,
      rp.updated_at,
      
      -- Profile information
      p.employee_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      
      -- SBU information
      s.id as sbu_id,
      s.name as sbu_name,
      
      -- Manager information
      mgr_p.id as manager_id,
      COALESCE(mgr_gi.first_name, mgr_p.first_name) as manager_first_name,
      COALESCE(mgr_gi.last_name, mgr_p.last_name) as manager_last_name,
      
      -- Project information
      pm.id as project_id,
      pm.project_name,
      pm.client_name,
      pm.budget,
      
      -- Bill type information
      bt.id as bill_type_id,
      bt.name as bill_type_name
      
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mgr_p ON p.manager = mgr_p.id
    LEFT JOIN general_information mgr_gi ON mgr_p.id = mgr_gi.profile_id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    
    WHERE 1=1
      -- Search filter
      AND (
        search_query IS NULL 
        OR search_query = ''
        OR p.employee_id ILIKE '%' || search_query || '%'
        OR COALESCE(gi.first_name, p.first_name, '') ILIKE '%' || search_query || '%'
        OR COALESCE(gi.last_name, p.last_name, '') ILIKE '%' || search_query || '%'
        OR CONCAT(COALESCE(gi.first_name, p.first_name, ''), ' ', COALESCE(gi.last_name, p.last_name, '')) ILIKE '%' || search_query || '%'
      )
      -- SBU filter
      AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
      -- Manager filter
      AND (manager_filter IS NULL OR p.manager = manager_filter)
      -- Bill type filter
      AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
      -- Project search
      AND (project_search IS NULL OR project_search = '' OR pm.project_name ILIKE '%' || project_search || '%')
      -- Engagement percentage filters
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      -- Billing percentage filters
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      -- Date filters
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to)
  ),
  
  counted_data AS (
    SELECT COUNT(*) as filtered_count FROM filtered_data
  ),
  
  paginated_data AS (
    SELECT *
    FROM filtered_data
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'asc' THEN last_name END ASC,
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'desc' THEN last_name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      created_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  )
  
  SELECT 
    json_build_object(
      'resource_planning', COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', pd.id,
            'profile_id', pd.profile_id,
            'engagement_percentage', pd.engagement_percentage,
            'billing_percentage', pd.billing_percentage,
            'engagement_start_date', pd.engagement_start_date,
            'release_date', pd.release_date,
            'engagement_complete', pd.engagement_complete,
            'weekly_validation', pd.weekly_validation,
            'created_at', pd.created_at,
            'updated_at', pd.updated_at,
            'profile', json_build_object(
              'id', pd.profile_id,
              'employee_id', pd.employee_id,
              'first_name', pd.first_name,
              'last_name', pd.last_name,
              'current_designation', NULL
            ),
            'bill_type', CASE 
              WHEN pd.bill_type_id IS NOT NULL THEN 
                json_build_object(
                  'id', pd.bill_type_id,
                  'name', pd.bill_type_name
                )
              ELSE NULL 
            END,
            'project', CASE 
              WHEN pd.project_id IS NOT NULL THEN 
                json_build_object(
                  'id', pd.project_id,
                  'project_name', pd.project_name,
                  'project_manager', NULL,
                  'client_name', pd.client_name,
                  'budget', pd.budget
                )
              ELSE NULL 
            END
          )
        ) FROM paginated_data pd),
        '[]'::json
      ),
      'pagination', json_build_object(
        'total_count', total_count,
        'filtered_count', (SELECT filtered_count FROM counted_data),
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL((SELECT filtered_count FROM counted_data)::numeric / items_per_page)
      )
    )
  INTO results_json;
  
  RETURN results_json;
END;
$$;
