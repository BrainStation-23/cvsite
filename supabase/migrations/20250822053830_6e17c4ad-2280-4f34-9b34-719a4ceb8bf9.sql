
-- Update get_planned_resource_data function to support additional sorting columns
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
  result json;
  total_count integer;
  filtered_count integer;
  resource_planning_array json;
BEGIN
  -- Get total count (unfiltered)
  SELECT COUNT(DISTINCT rp.id)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id;

  -- Build the main query with proper JOINs for sorting
  WITH filtered_data AS (
    SELECT DISTINCT
      rp.id,
      rp.profile_id,
      rp.project_id,
      rp.bill_type_id,
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
      p.first_name as profile_first_name,
      p.last_name as profile_last_name,
      p.sbu_id,
      p.manager as manager_id,
      
      -- General information (preferred over profile data)
      gi.first_name,
      gi.last_name,
      gi.current_designation,
      
      -- SBU information
      s.name as sbu_name,
      
      -- Manager information
      m.first_name as manager_first_name,
      m.last_name as manager_last_name,
      
      -- Bill type information
      bt.name as bill_type_name,
      
      -- Project information
      pm.project_name,
      pm.client_name,
      pm.project_manager,
      pm.budget
      
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles m ON p.manager = m.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    
    WHERE (
      search_query IS NULL OR 
      COALESCE(gi.first_name, p.first_name, '') ILIKE '%' || search_query || '%' OR
      COALESCE(gi.last_name, p.last_name, '') ILIKE '%' || search_query || '%' OR
      p.employee_id ILIKE '%' || search_query || '%' OR
      s.name ILIKE '%' || search_query || '%' OR
      bt.name ILIKE '%' || search_query || '%' OR
      pm.project_name ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR p.manager = manager_filter)
    AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
    AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
    AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
    AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
    AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
    AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
    AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  ),
  
  paginated_data AS (
    SELECT *
    FROM filtered_data
    ORDER BY
      -- Employee name sorting
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'asc' THEN COALESCE(last_name, profile_last_name) END ASC,
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'desc' THEN COALESCE(last_name, profile_last_name) END DESC,
      
      -- Employee ID sorting
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN employee_id END DESC,
      
      -- Engagement percentage sorting
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      
      -- Billing percentage sorting
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      
      -- Bill type sorting
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'asc' THEN bill_type_name END ASC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'desc' THEN bill_type_name END DESC,
      
      -- Project sorting
      CASE WHEN sort_by = 'project' AND sort_order = 'asc' THEN project_name END ASC,
      CASE WHEN sort_by = 'project' AND sort_order = 'desc' THEN project_name END DESC,
      
      -- Engagement start date sorting
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'asc' THEN engagement_start_date END ASC NULLS LAST,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'desc' THEN engagement_start_date END DESC NULLS LAST,
      
      -- Release date sorting
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN release_date END ASC NULLS LAST,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN release_date END DESC NULLS LAST,
      
      -- Created at sorting (default)
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      
      -- Default fallback
      CASE WHEN sort_by NOT IN ('profile.last_name', 'employee_id', 'engagement_percentage', 'billing_percentage', 'bill_type', 'project', 'engagement_start_date', 'release_date', 'created_at') THEN created_at END DESC
      
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  )
  
  -- Get filtered count
  SELECT COUNT(*) INTO filtered_count FROM filtered_data;
  
  -- Build the result JSON
  SELECT json_agg(
    json_build_object(
      'id', pd.id,
      'profile_id', pd.profile_id,
      'project_id', pd.project_id,
      'bill_type_id', pd.bill_type_id,
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
        'first_name', COALESCE(pd.first_name, pd.profile_first_name),
        'last_name', COALESCE(pd.last_name, pd.profile_last_name),
        'current_designation', pd.current_designation,
        'sbu', json_build_object(
          'id', pd.sbu_id,
          'name', pd.sbu_name
        ),
        'manager', CASE 
          WHEN pd.manager_id IS NOT NULL THEN json_build_object(
            'id', pd.manager_id,
            'first_name', pd.manager_first_name,
            'last_name', pd.manager_last_name
          )
          ELSE NULL
        END
      ),
      'bill_type', CASE 
        WHEN pd.bill_type_id IS NOT NULL THEN json_build_object(
          'id', pd.bill_type_id,
          'name', pd.bill_type_name
        )
        ELSE NULL
      END,
      'project', CASE 
        WHEN pd.project_id IS NOT NULL THEN json_build_object(
          'id', pd.project_id,
          'project_name', pd.project_name,
          'client_name', pd.client_name,
          'project_manager', pd.project_manager,
          'budget', pd.budget
        )
        ELSE NULL
      END
    )
  )
  INTO resource_planning_array
  FROM paginated_data pd;
  
  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO result;
  
  RETURN result;
END;
$function$

-- Update get_weekly_validation_data function to support additional sorting columns
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
  result json;
  total_count integer;
  filtered_count integer;
  resource_planning_array json;
BEGIN
  -- Get total count (unfiltered) - only records that need weekly validation
  SELECT COUNT(DISTINCT rp.id)
  INTO total_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  WHERE (rp.weekly_validation = false OR rp.weekly_validation IS NULL)
    AND rp.engagement_complete = false;

  -- Build the main query with proper JOINs for sorting - only records that need weekly validation
  WITH filtered_data AS (
    SELECT DISTINCT
      rp.id,
      rp.profile_id,
      rp.project_id,
      rp.bill_type_id,
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
      p.first_name as profile_first_name,
      p.last_name as profile_last_name,
      p.sbu_id,
      p.manager as manager_id,
      
      -- General information (preferred over profile data)
      gi.first_name,
      gi.last_name,
      gi.current_designation,
      
      -- SBU information
      s.name as sbu_name,
      
      -- Manager information
      m.first_name as manager_first_name,
      m.last_name as manager_last_name,
      
      -- Bill type information
      bt.name as bill_type_name,
      
      -- Project information
      pm.project_name,
      pm.client_name,
      pm.project_manager,
      pm.budget
      
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles m ON p.manager = m.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    
    WHERE (rp.weekly_validation = false OR rp.weekly_validation IS NULL)
      AND rp.engagement_complete = false
      AND (
        search_query IS NULL OR 
        COALESCE(gi.first_name, p.first_name, '') ILIKE '%' || search_query || '%' OR
        COALESCE(gi.last_name, p.last_name, '') ILIKE '%' || search_query || '%' OR
        p.employee_id ILIKE '%' || search_query || '%' OR
        s.name ILIKE '%' || search_query || '%' OR
        bt.name ILIKE '%' || search_query || '%' OR
        pm.project_name ILIKE '%' || search_query || '%'
      )
      AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
      AND (manager_filter IS NULL OR p.manager = manager_filter)
      AND (bill_type_filter IS NULL OR rp.bill_type_id = bill_type_filter)
      AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  ),
  
  paginated_data AS (
    SELECT *
    FROM filtered_data
    ORDER BY
      -- Employee name sorting
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'asc' THEN COALESCE(last_name, profile_last_name) END ASC,
      CASE WHEN sort_by = 'profile.last_name' AND sort_order = 'desc' THEN COALESCE(last_name, profile_last_name) END DESC,
      
      -- Employee ID sorting
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN employee_id END DESC,
      
      -- Engagement percentage sorting
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      
      -- Billing percentage sorting
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      
      -- Bill type sorting
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'asc' THEN bill_type_name END ASC,
      CASE WHEN sort_by = 'bill_type' AND sort_order = 'desc' THEN bill_type_name END DESC,
      
      -- Project sorting
      CASE WHEN sort_by = 'project' AND sort_order = 'asc' THEN project_name END ASC,
      CASE WHEN sort_by = 'project' AND sort_order = 'desc' THEN project_name END DESC,
      
      -- Engagement start date sorting
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'asc' THEN engagement_start_date END ASC NULLS LAST,
      CASE WHEN sort_by = 'engagement_start_date' AND sort_order = 'desc' THEN engagement_start_date END DESC NULLS LAST,
      
      -- Release date sorting
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN release_date END ASC NULLS LAST,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN release_date END DESC NULLS LAST,
      
      -- Created at sorting (default)
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      
      -- Default fallback
      CASE WHEN sort_by NOT IN ('profile.last_name', 'employee_id', 'engagement_percentage', 'billing_percentage', 'bill_type', 'project', 'engagement_start_date', 'release_date', 'created_at') THEN created_at END DESC
      
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  )
  
  -- Get filtered count
  SELECT COUNT(*) INTO filtered_count FROM filtered_data;
  
  -- Build the result JSON
  SELECT json_agg(
    json_build_object(
      'id', pd.id,
      'profile_id', pd.profile_id,
      'project_id', pd.project_id,
      'bill_type_id', pd.bill_type_id,
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
        'first_name', COALESCE(pd.first_name, pd.profile_first_name),
        'last_name', COALESCE(pd.last_name, pd.profile_last_name),
        'current_designation', pd.current_designation,
        'sbu', json_build_object(
          'id', pd.sbu_id,
          'name', pd.sbu_name
        ),
        'manager', CASE 
          WHEN pd.manager_id IS NOT NULL THEN json_build_object(
            'id', pd.manager_id,
            'first_name', pd.manager_first_name,
            'last_name', pd.manager_last_name
          )
          ELSE NULL
        END
      ),
      'bill_type', CASE 
        WHEN pd.bill_type_id IS NOT NULL THEN json_build_object(
          'id', pd.bill_type_id,
          'name', pd.bill_type_name
        )
        ELSE NULL
      END,
      'project', CASE 
        WHEN pd.project_id IS NOT NULL THEN json_build_object(
          'id', pd.project_id,
          'project_name', pd.project_name,
          'client_name', pd.client_name,
          'project_manager', pd.project_manager,
          'budget', pd.budget
        )
        ELSE NULL
      END
    )
  )
  INTO resource_planning_array
  FROM paginated_data pd;
  
  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO result;
  
  RETURN result;
END;
$function$
