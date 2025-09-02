
-- Create a comprehensive view for resource planning with enriched project data
CREATE OR REPLACE VIEW resource_planning_enriched_view AS
SELECT 
  -- Resource planning core fields
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
  rp.forecasted_project,
  rp.created_at,
  rp.updated_at,
  
  -- Profile information
  p.first_name as profile_first_name,
  p.last_name as profile_last_name,
  p.employee_id as profile_employee_id,
  p.email as profile_email,
  p.sbu_id as profile_sbu_id,
  p.manager as profile_manager_id,
  
  -- General information (prioritized over profile fields)
  COALESCE(gi.first_name, p.first_name) as first_name,
  COALESCE(gi.last_name, p.last_name) as last_name,
  gi.profile_image,
  gi.current_designation,
  
  -- SBU information
  s.name as sbu_name,
  s.sbu_head_name,
  s.sbu_head_email,
  
  -- Manager information
  mp.first_name as manager_first_name,
  mp.last_name as manager_last_name,
  mp.employee_id as manager_employee_id,
  COALESCE(mgi.first_name, mp.first_name) as manager_display_first_name,
  COALESCE(mgi.last_name, mp.last_name) as manager_display_last_name,
  CONCAT(
    COALESCE(mgi.first_name, mp.first_name), ' ',
    COALESCE(mgi.last_name, mp.last_name)
  ) as manager_full_name,
  
  -- Project information (including new fields)
  pm.project_name,
  pm.client_name,
  pm.description as project_description,
  pm.budget as project_budget,
  pm.is_active as project_is_active,
  pm.project_level,
  pm.project_bill_type,
  pm.project_manager as project_manager_id,
  
  -- Project manager information
  pmp.first_name as project_manager_first_name,
  pmp.last_name as project_manager_last_name,
  pmp.employee_id as project_manager_employee_id,
  COALESCE(pmgi.first_name, pmp.first_name) as project_manager_display_first_name,
  COALESCE(pmgi.last_name, pmp.last_name) as project_manager_display_last_name,
  CONCAT(
    COALESCE(pmgi.first_name, pmp.first_name), ' ',
    COALESCE(pmgi.last_name, pmp.last_name)
  ) as project_manager_full_name,
  
  -- Project type information
  pt.name as project_type_name,
  
  -- Bill type information
  bt.name as bill_type_name,
  bt.is_billable as bill_type_is_billable,
  bt.non_billed as bill_type_non_billed,
  bt.is_support as bill_type_is_support,
  bt.color_code as bill_type_color_code,
  
  -- Computed search fields
  CONCAT(
    COALESCE(gi.first_name, p.first_name), ' ',
    COALESCE(gi.last_name, p.last_name)
  ) as full_name,
  
  -- Search text for efficient filtering
  CONCAT_WS(' ',
    COALESCE(gi.first_name, p.first_name),
    COALESCE(gi.last_name, p.last_name),
    p.employee_id,
    pm.project_name,
    pm.client_name,
    pm.project_level,
    pm.project_bill_type,
    pt.name,
    bt.name,
    s.name
  ) as search_text

FROM resource_planning rp
LEFT JOIN profiles p ON rp.profile_id = p.id
LEFT JOIN general_information gi ON p.id = gi.profile_id
LEFT JOIN sbus s ON p.sbu_id = s.id
LEFT JOIN profiles mp ON p.manager = mp.id
LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
LEFT JOIN projects_management pm ON rp.project_id = pm.id
LEFT JOIN profiles pmp ON pm.project_manager = pmp.id
LEFT JOIN general_information pmgi ON pmp.id = pmgi.profile_id
LEFT JOIN project_types pt ON pm.project_type = pt.id
LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id;

-- Update get_planned_resource_data function to use the new view and add new filters
CREATE OR REPLACE FUNCTION get_planned_resource_data(
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
  end_date_to text DEFAULT NULL,
  project_level_filter text DEFAULT NULL,
  project_bill_type_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resource_planning_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  resource_planning_array JSON;
BEGIN
  -- Get total count (all non-complete engagements)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning_enriched_view
  WHERE engagement_complete = false;
  
  -- Get filtered count
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning_enriched_view
  WHERE engagement_complete = false
    AND (search_query IS NULL OR search_text ILIKE '%' || search_query || '%')
    AND (sbu_filter IS NULL OR profile_sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR profile_manager_id = manager_filter)
    AND (bill_type_filter IS NULL OR bill_type_id = bill_type_filter)
    AND (project_search IS NULL OR project_name ILIKE '%' || project_search || '%')
    AND (min_engagement_percentage IS NULL OR engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR billing_percentage <= max_billing_percentage)
    AND (start_date_from IS NULL OR engagement_start_date >= start_date_from::date)
    AND (start_date_to IS NULL OR engagement_start_date <= start_date_to::date)
    AND (end_date_from IS NULL OR release_date >= end_date_from::date)
    AND (end_date_to IS NULL OR release_date <= end_date_to::date)
    AND (project_level_filter IS NULL OR project_level ILIKE '%' || project_level_filter || '%')
    AND (project_bill_type_filter IS NULL OR project_bill_type ILIKE '%' || project_bill_type_filter || '%');
  
  -- Get paginated and sorted results
  SELECT json_agg(
    json_build_object(
      'id', id,
      'profile_id', profile_id,
      'project_id', project_id,
      'bill_type_id', bill_type_id,
      'engagement_percentage', engagement_percentage,
      'billing_percentage', billing_percentage,
      'engagement_start_date', engagement_start_date,
      'release_date', release_date,
      'engagement_complete', engagement_complete,
      'weekly_validation', weekly_validation,
      'forecasted_project', forecasted_project,
      'created_at', created_at,
      'updated_at', updated_at,
      'profile', json_build_object(
        'id', profile_id,
        'first_name', first_name,
        'last_name', last_name,
        'employee_id', profile_employee_id,
        'email', profile_email,
        'profile_image', profile_image,
        'current_designation', current_designation
      ),
      'sbu', CASE WHEN sbu_name IS NOT NULL THEN
        json_build_object(
          'id', profile_sbu_id,
          'name', sbu_name,
          'sbu_head_name', sbu_head_name,
          'sbu_head_email', sbu_head_email
        )
        ELSE NULL
      END,
      'manager', CASE WHEN manager_full_name IS NOT NULL THEN
        json_build_object(
          'id', profile_manager_id,
          'first_name', manager_display_first_name,
          'last_name', manager_display_last_name,
          'employee_id', manager_employee_id,
          'full_name', manager_full_name
        )
        ELSE NULL
      END,
      'project', CASE WHEN project_name IS NOT NULL THEN
        json_build_object(
          'id', project_id,
          'project_name', project_name,
          'client_name', client_name,
          'description', project_description,
          'budget', project_budget,
          'is_active', project_is_active,
          'project_level', project_level,
          'project_bill_type', project_bill_type,
          'project_type_name', project_type_name,
          'project_manager', CASE WHEN project_manager_full_name IS NOT NULL THEN
            json_build_object(
              'id', project_manager_id,
              'first_name', project_manager_display_first_name,
              'last_name', project_manager_display_last_name,
              'employee_id', project_manager_employee_id,
              'full_name', project_manager_full_name
            )
            ELSE NULL
          END
        )
        ELSE NULL
      END,
      'bill_type', CASE WHEN bill_type_name IS NOT NULL THEN
        json_build_object(
          'id', bill_type_id,
          'name', bill_type_name,
          'is_billable', bill_type_is_billable,
          'non_billed', bill_type_non_billed,
          'is_support', bill_type_is_support,
          'color_code', bill_type_color_code
        )
        ELSE NULL
      END
    )
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN last_name END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN profile_employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN profile_employee_id END DESC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN project_name END DESC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'asc' THEN client_name END ASC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'desc' THEN client_name END DESC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'asc' THEN project_level END ASC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'desc' THEN project_level END DESC,
      CASE WHEN sort_by = 'project_bill_type' AND sort_order = 'asc' THEN project_bill_type END ASC,
      CASE WHEN sort_by = 'project_bill_type' AND sort_order = 'desc' THEN project_bill_type END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN release_date END DESC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'asc' THEN sbu_name END ASC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'desc' THEN sbu_name END DESC,
      CASE WHEN sort_by = 'bill_type_name' AND sort_order = 'asc' THEN bill_type_name END ASC,
      CASE WHEN sort_by = 'bill_type_name' AND sort_order = 'desc' THEN bill_type_name END DESC,
      created_at DESC
  )
  INTO resource_planning_array
  FROM (
    SELECT *
    FROM resource_planning_enriched_view
    WHERE engagement_complete = false
      AND (search_query IS NULL OR search_text ILIKE '%' || search_query || '%')
      AND (sbu_filter IS NULL OR profile_sbu_id = sbu_filter)
      AND (manager_filter IS NULL OR profile_manager_id = manager_filter)
      AND (bill_type_filter IS NULL OR bill_type_id = bill_type_filter)
      AND (project_search IS NULL OR project_name ILIKE '%' || project_search || '%')
      AND (min_engagement_percentage IS NULL OR engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR release_date <= end_date_to::date)
      AND (project_level_filter IS NULL OR project_level ILIKE '%' || project_level_filter || '%')
      AND (project_bill_type_filter IS NULL OR project_bill_type ILIKE '%' || project_bill_type_filter || '%')
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) sub;
  
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
  ) INTO resource_planning_data;
  
  RETURN resource_planning_data;
END;
$$;

-- Update get_weekly_validation_data function to use the new view and add new filters
CREATE OR REPLACE FUNCTION get_weekly_validation_data(
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
  end_date_to text DEFAULT NULL,
  project_level_filter text DEFAULT NULL,
  project_bill_type_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resource_planning_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  resource_planning_array JSON;
BEGIN
  -- Get total count (non-complete and non-validated)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning_enriched_view
  WHERE engagement_complete = false AND weekly_validation = false;
  
  -- Get filtered count
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning_enriched_view
  WHERE engagement_complete = false 
    AND weekly_validation = false
    AND (search_query IS NULL OR search_text ILIKE '%' || search_query || '%')
    AND (sbu_filter IS NULL OR profile_sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR profile_manager_id = manager_filter)
    AND (bill_type_filter IS NULL OR bill_type_id = bill_type_filter)
    AND (project_search IS NULL OR project_name ILIKE '%' || project_search || '%')
    AND (min_engagement_percentage IS NULL OR engagement_percentage >= min_engagement_percentage)
    AND (max_engagement_percentage IS NULL OR engagement_percentage <= max_engagement_percentage)
    AND (min_billing_percentage IS NULL OR billing_percentage >= min_billing_percentage)
    AND (max_billing_percentage IS NULL OR billing_percentage <= max_billing_percentage)
    AND (start_date_from IS NULL OR engagement_start_date >= start_date_from::date)
    AND (start_date_to IS NULL OR engagement_start_date <= start_date_to::date)
    AND (end_date_from IS NULL OR release_date >= end_date_from::date)
    AND (end_date_to IS NULL OR release_date <= end_date_to::date)
    AND (project_level_filter IS NULL OR project_level ILIKE '%' || project_level_filter || '%')
    AND (project_bill_type_filter IS NULL OR project_bill_type ILIKE '%' || project_bill_type_filter || '%');
  
  -- Get paginated and sorted results (same structure as planned resources)
  SELECT json_agg(
    json_build_object(
      'id', id,
      'profile_id', profile_id,
      'project_id', project_id,
      'bill_type_id', bill_type_id,
      'engagement_percentage', engagement_percentage,
      'billing_percentage', billing_percentage,
      'engagement_start_date', engagement_start_date,
      'release_date', release_date,
      'engagement_complete', engagement_complete,
      'weekly_validation', weekly_validation,
      'forecasted_project', forecasted_project,
      'created_at', created_at,
      'updated_at', updated_at,
      'profile', json_build_object(
        'id', profile_id,
        'first_name', first_name,
        'last_name', last_name,
        'employee_id', profile_employee_id,
        'email', profile_email,
        'profile_image', profile_image,
        'current_designation', current_designation
      ),
      'sbu', CASE WHEN sbu_name IS NOT NULL THEN
        json_build_object(
          'id', profile_sbu_id,
          'name', sbu_name,
          'sbu_head_name', sbu_head_name,
          'sbu_head_email', sbu_head_email
        )
        ELSE NULL
      END,
      'manager', CASE WHEN manager_full_name IS NOT NULL THEN
        json_build_object(
          'id', profile_manager_id,
          'first_name', manager_display_first_name,
          'last_name', manager_display_last_name,
          'employee_id', manager_employee_id,
          'full_name', manager_full_name
        )
        ELSE NULL
      END,
      'project', CASE WHEN project_name IS NOT NULL THEN
        json_build_object(
          'id', project_id,
          'project_name', project_name,
          'client_name', client_name,
          'description', project_description,
          'budget', project_budget,
          'is_active', project_is_active,
          'project_level', project_level,
          'project_bill_type', project_bill_type,
          'project_type_name', project_type_name,
          'project_manager', CASE WHEN project_manager_full_name IS NOT NULL THEN
            json_build_object(
              'id', project_manager_id,
              'first_name', project_manager_display_first_name,
              'last_name', project_manager_display_last_name,
              'employee_id', project_manager_employee_id,
              'full_name', project_manager_full_name
            )
            ELSE NULL
          END
        )
        ELSE NULL
      END,
      'bill_type', CASE WHEN bill_type_name IS NOT NULL THEN
        json_build_object(
          'id', bill_type_id,
          'name', bill_type_name,
          'is_billable', bill_type_is_billable,
          'non_billed', bill_type_non_billed,
          'is_support', bill_type_is_support,
          'color_code', bill_type_color_code
        )
        ELSE NULL
      END
    )
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN last_name END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN profile_employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN profile_employee_id END DESC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN project_name END DESC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'asc' THEN client_name END ASC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'desc' THEN client_name END DESC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'asc' THEN project_level END ASC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'desc' THEN project_level END DESC,
      CASE WHEN sort_by = 'project_bill_type' AND sort_order = 'asc' THEN project_bill_type END ASC,
      CASE WHEN sort_by = 'project_bill_type' AND sort_order = 'desc' THEN project_bill_type END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN engagement_percentage END DESC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'asc' THEN billing_percentage END ASC,
      CASE WHEN sort_by = 'billing_percentage' AND sort_order = 'desc' THEN billing_percentage END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN release_date END DESC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'asc' THEN sbu_name END ASC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'desc' THEN sbu_name END DESC,
      CASE WHEN sort_by = 'bill_type_name' AND sort_order = 'asc' THEN bill_type_name END ASC,
      CASE WHEN sort_by = 'bill_type_name' AND sort_order = 'desc' THEN bill_type_name END DESC,
      created_at DESC
  )
  INTO resource_planning_array
  FROM (
    SELECT *
    FROM resource_planning_enriched_view
    WHERE engagement_complete = false 
      AND weekly_validation = false
      AND (search_query IS NULL OR search_text ILIKE '%' || search_query || '%')
      AND (sbu_filter IS NULL OR profile_sbu_id = sbu_filter)
      AND (manager_filter IS NULL OR profile_manager_id = manager_filter)
      AND (bill_type_filter IS NULL OR bill_type_id = bill_type_filter)
      AND (project_search IS NULL OR project_name ILIKE '%' || project_search || '%')
      AND (min_engagement_percentage IS NULL OR engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR release_date <= end_date_to::date)
      AND (project_level_filter IS NULL OR project_level ILIKE '%' || project_level_filter || '%')
      AND (project_bill_type_filter IS NULL OR project_bill_type ILIKE '%' || project_bill_type_filter || '%')
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) sub;
  
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
  ) INTO resource_planning_data;
  
  RETURN resource_planning_data;
END;
$$;
