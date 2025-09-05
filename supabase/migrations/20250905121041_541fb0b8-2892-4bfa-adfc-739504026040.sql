-- Create RPC function to search resource planning audit logs with proper ID mapping
CREATE OR REPLACE FUNCTION public.search_resource_planning_audit_logs(
  search_query TEXT DEFAULT NULL,
  employee_id_filter TEXT DEFAULT NULL,
  bill_type_filter TEXT DEFAULT NULL,
  project_name_filter TEXT DEFAULT NULL,
  forecasted_project_filter TEXT DEFAULT NULL,
  operation_type_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  items_per_page INTEGER DEFAULT 10,
  sort_by TEXT DEFAULT 'changed_at',
  sort_order TEXT DEFAULT 'desc'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  audit_array JSON;
BEGIN
  -- Calculate total audit logs count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning_audit_logs;
  
  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM resource_planning_audit_logs ral
  LEFT JOIN profiles p_old ON (ral.old_data->>'profile_id')::uuid = p_old.id
  LEFT JOIN profiles p_new ON (ral.new_data->>'profile_id')::uuid = p_new.id
  LEFT JOIN general_information gi_old ON p_old.id = gi_old.profile_id
  LEFT JOIN general_information gi_new ON p_new.id = gi_new.profile_id
  LEFT JOIN projects_management pm_old ON (ral.old_data->>'project_id')::uuid = pm_old.id
  LEFT JOIN projects_management pm_new ON (ral.new_data->>'project_id')::uuid = pm_new.id
  LEFT JOIN bill_types bt_old ON (ral.old_data->>'bill_type_id')::uuid = bt_old.id
  LEFT JOIN bill_types bt_new ON (ral.new_data->>'bill_type_id')::uuid = bt_new.id
  WHERE (
    search_query IS NULL 
    OR COALESCE(p_old.first_name, gi_old.first_name) ILIKE '%' || search_query || '%'
    OR COALESCE(p_old.last_name, gi_old.last_name) ILIKE '%' || search_query || '%'
    OR COALESCE(p_new.first_name, gi_new.first_name) ILIKE '%' || search_query || '%'
    OR COALESCE(p_new.last_name, gi_new.last_name) ILIKE '%' || search_query || '%'
    OR p_old.employee_id ILIKE '%' || search_query || '%'
    OR p_new.employee_id ILIKE '%' || search_query || '%'
    OR pm_old.project_name ILIKE '%' || search_query || '%'
    OR pm_new.project_name ILIKE '%' || search_query || '%'
    OR bt_old.name ILIKE '%' || search_query || '%'
    OR bt_new.name ILIKE '%' || search_query || '%'
    OR ral.old_data->>'forecasted_project' ILIKE '%' || search_query || '%'
    OR ral.new_data->>'forecasted_project' ILIKE '%' || search_query || '%'
  )
  AND (employee_id_filter IS NULL OR p_old.employee_id ILIKE '%' || employee_id_filter || '%' OR p_new.employee_id ILIKE '%' || employee_id_filter || '%')
  AND (bill_type_filter IS NULL OR bt_old.name ILIKE '%' || bill_type_filter || '%' OR bt_new.name ILIKE '%' || bill_type_filter || '%')
  AND (project_name_filter IS NULL OR pm_old.project_name ILIKE '%' || project_name_filter || '%' OR pm_new.project_name ILIKE '%' || project_name_filter || '%')
  AND (forecasted_project_filter IS NULL OR ral.old_data->>'forecasted_project' ILIKE '%' || forecasted_project_filter || '%' OR ral.new_data->>'forecasted_project' ILIKE '%' || forecasted_project_filter || '%')
  AND (operation_type_filter IS NULL OR ral.operation_type = operation_type_filter)
  AND (date_from IS NULL OR ral.changed_at::date >= date_from)
  AND (date_to IS NULL OR ral.changed_at::date <= date_to);
  
  -- Build audit logs query with enriched data
  SELECT json_agg(
    json_build_object(
      'id', ral.id,
      'resource_planning_id', ral.resource_planning_id,
      'operation_type', ral.operation_type,
      'changed_by', ral.changed_by,
      'changed_at', ral.changed_at,
      'changed_fields', ral.changed_fields,
      'created_at', ral.created_at,
      
      -- Enriched old data
      'old_data_enriched', CASE 
        WHEN ral.old_data IS NOT NULL THEN
          json_build_object(
            'raw_data', ral.old_data,
            'profile', CASE 
              WHEN p_old.id IS NOT NULL THEN
                json_build_object(
                  'id', p_old.id,
                  'first_name', COALESCE(gi_old.first_name, p_old.first_name),
                  'last_name', COALESCE(gi_old.last_name, p_old.last_name),
                  'employee_id', p_old.employee_id,
                  'email', p_old.email
                )
              ELSE NULL
            END,
            'project', CASE 
              WHEN pm_old.id IS NOT NULL THEN
                json_build_object(
                  'id', pm_old.id,
                  'project_name', pm_old.project_name,
                  'client_name', pm_old.client_name
                )
              ELSE NULL
            END,
            'bill_type', CASE 
              WHEN bt_old.id IS NOT NULL THEN
                json_build_object(
                  'id', bt_old.id,
                  'name', bt_old.name,
                  'is_billable', bt_old.is_billable
                )
              ELSE NULL
            END,
            'engagement_percentage', (ral.old_data->>'engagement_percentage')::real,
            'billing_percentage', (ral.old_data->>'billing_percentage')::real,
            'engagement_start_date', (ral.old_data->>'engagement_start_date')::date,
            'release_date', (ral.old_data->>'release_date')::date,
            'engagement_complete', (ral.old_data->>'engagement_complete')::boolean,
            'weekly_validation', (ral.old_data->>'weekly_validation')::boolean,
            'forecasted_project', ral.old_data->>'forecasted_project'
          )
        ELSE NULL
      END,
      
      -- Enriched new data
      'new_data_enriched', CASE 
        WHEN ral.new_data IS NOT NULL THEN
          json_build_object(
            'raw_data', ral.new_data,
            'profile', CASE 
              WHEN p_new.id IS NOT NULL THEN
                json_build_object(
                  'id', p_new.id,
                  'first_name', COALESCE(gi_new.first_name, p_new.first_name),
                  'last_name', COALESCE(gi_new.last_name, p_new.last_name),
                  'employee_id', p_new.employee_id,
                  'email', p_new.email
                )
              ELSE NULL
            END,
            'project', CASE 
              WHEN pm_new.id IS NOT NULL THEN
                json_build_object(
                  'id', pm_new.id,
                  'project_name', pm_new.project_name,
                  'client_name', pm_new.client_name
                )
              ELSE NULL
            END,
            'bill_type', CASE 
              WHEN bt_new.id IS NOT NULL THEN
                json_build_object(
                  'id', bt_new.id,
                  'name', bt_new.name,
                  'is_billable', bt_new.is_billable
                )
              ELSE NULL
            END,
            'engagement_percentage', (ral.new_data->>'engagement_percentage')::real,
            'billing_percentage', (ral.new_data->>'billing_percentage')::real,
            'engagement_start_date', (ral.new_data->>'engagement_start_date')::date,
            'release_date', (ral.new_data->>'release_date')::date,
            'engagement_complete', (ral.new_data->>'engagement_complete')::boolean,
            'weekly_validation', (ral.new_data->>'weekly_validation')::boolean,
            'forecasted_project', ral.new_data->>'forecasted_project'
          )
        ELSE NULL
      END,
      
      -- Changed by user info
      'changed_by_user', CASE 
        WHEN cb_p.id IS NOT NULL THEN
          json_build_object(
            'id', cb_p.id,
            'first_name', COALESCE(cb_gi.first_name, cb_p.first_name),
            'last_name', COALESCE(cb_gi.last_name, cb_p.last_name),
            'employee_id', cb_p.employee_id,
            'email', cb_p.email
          )
        ELSE NULL
      END
    )
    ORDER BY
      CASE WHEN sort_by = 'changed_at' AND sort_order = 'asc' THEN ral.changed_at END ASC,
      CASE WHEN sort_by = 'changed_at' AND sort_order = 'desc' THEN ral.changed_at END DESC,
      CASE WHEN sort_by = 'operation_type' AND sort_order = 'asc' THEN ral.operation_type END ASC,
      CASE WHEN sort_by = 'operation_type' AND sort_order = 'desc' THEN ral.operation_type END DESC,
      CASE WHEN sort_by = 'employee' AND sort_order = 'asc' THEN 
        CONCAT(COALESCE(gi_new.first_name, p_new.first_name, gi_old.first_name, p_old.first_name), ' ', 
               COALESCE(gi_new.last_name, p_new.last_name, gi_old.last_name, p_old.last_name)) END ASC,
      CASE WHEN sort_by = 'employee' AND sort_order = 'desc' THEN 
        CONCAT(COALESCE(gi_new.first_name, p_new.first_name, gi_old.first_name, p_old.first_name), ' ', 
               COALESCE(gi_new.last_name, p_new.last_name, gi_old.last_name, p_old.last_name)) END DESC,
      -- Default sorting
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('changed_at', 'operation_type', 'employee')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN ral.changed_at END DESC
  )
  INTO audit_array
  FROM (
    SELECT ral.*
    FROM resource_planning_audit_logs ral
    LEFT JOIN profiles p_old ON (ral.old_data->>'profile_id')::uuid = p_old.id
    LEFT JOIN profiles p_new ON (ral.new_data->>'profile_id')::uuid = p_new.id
    LEFT JOIN general_information gi_old ON p_old.id = gi_old.profile_id
    LEFT JOIN general_information gi_new ON p_new.id = gi_new.profile_id
    LEFT JOIN projects_management pm_old ON (ral.old_data->>'project_id')::uuid = pm_old.id
    LEFT JOIN projects_management pm_new ON (ral.new_data->>'project_id')::uuid = pm_new.id
    LEFT JOIN bill_types bt_old ON (ral.old_data->>'bill_type_id')::uuid = bt_old.id
    LEFT JOIN bill_types bt_new ON (ral.new_data->>'bill_type_id')::uuid = bt_new.id
    WHERE (
      search_query IS NULL 
      OR COALESCE(p_old.first_name, gi_old.first_name) ILIKE '%' || search_query || '%'
      OR COALESCE(p_old.last_name, gi_old.last_name) ILIKE '%' || search_query || '%'
      OR COALESCE(p_new.first_name, gi_new.first_name) ILIKE '%' || search_query || '%'
      OR COALESCE(p_new.last_name, gi_new.last_name) ILIKE '%' || search_query || '%'
      OR p_old.employee_id ILIKE '%' || search_query || '%'
      OR p_new.employee_id ILIKE '%' || search_query || '%'
      OR pm_old.project_name ILIKE '%' || search_query || '%'
      OR pm_new.project_name ILIKE '%' || search_query || '%'
      OR bt_old.name ILIKE '%' || search_query || '%'
      OR bt_new.name ILIKE '%' || search_query || '%'
      OR ral.old_data->>'forecasted_project' ILIKE '%' || search_query || '%'
      OR ral.new_data->>'forecasted_project' ILIKE '%' || search_query || '%'
    )
    AND (employee_id_filter IS NULL OR p_old.employee_id ILIKE '%' || employee_id_filter || '%' OR p_new.employee_id ILIKE '%' || employee_id_filter || '%')
    AND (bill_type_filter IS NULL OR bt_old.name ILIKE '%' || bill_type_filter || '%' OR bt_new.name ILIKE '%' || bill_type_filter || '%')
    AND (project_name_filter IS NULL OR pm_old.project_name ILIKE '%' || project_name_filter || '%' OR pm_new.project_name ILIKE '%' || project_name_filter || '%')
    AND (forecasted_project_filter IS NULL OR ral.old_data->>'forecasted_project' ILIKE '%' || forecasted_project_filter || '%' OR ral.new_data->>'forecasted_project' ILIKE '%' || forecasted_project_filter || '%')
    AND (operation_type_filter IS NULL OR ral.operation_type = operation_type_filter)
    AND (date_from IS NULL OR ral.changed_at::date >= date_from)
    AND (date_to IS NULL OR ral.changed_at::date <= date_to)
    
    ORDER BY
      CASE WHEN sort_by = 'changed_at' AND sort_order = 'asc' THEN ral.changed_at END ASC,
      CASE WHEN sort_by = 'changed_at' AND sort_order = 'desc' THEN ral.changed_at END DESC,
      CASE WHEN sort_by = 'operation_type' AND sort_order = 'asc' THEN ral.operation_type END ASC,
      CASE WHEN sort_by = 'operation_type' AND sort_order = 'desc' THEN ral.operation_type END DESC,
      CASE WHEN sort_by = 'employee' AND sort_order = 'asc' THEN 
        CONCAT(COALESCE(gi_new.first_name, p_new.first_name, gi_old.first_name, p_old.first_name), ' ', 
               COALESCE(gi_new.last_name, p_new.last_name, gi_old.last_name, p_old.last_name)) END ASC,
      CASE WHEN sort_by = 'employee' AND sort_order = 'desc' THEN 
        CONCAT(COALESCE(gi_new.first_name, p_new.first_name, gi_old.first_name, p_old.first_name), ' ', 
               COALESCE(gi_new.last_name, p_new.last_name, gi_old.last_name, p_old.last_name)) END DESC,
      -- Default sorting
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('changed_at', 'operation_type', 'employee')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN ral.changed_at END DESC
    
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) ral
  LEFT JOIN profiles p_old ON (ral.old_data->>'profile_id')::uuid = p_old.id
  LEFT JOIN profiles p_new ON (ral.new_data->>'profile_id')::uuid = p_new.id
  LEFT JOIN general_information gi_old ON p_old.id = gi_old.profile_id
  LEFT JOIN general_information gi_new ON p_new.id = gi_new.profile_id
  LEFT JOIN projects_management pm_old ON (ral.old_data->>'project_id')::uuid = pm_old.id
  LEFT JOIN projects_management pm_new ON (ral.new_data->>'project_id')::uuid = pm_new.id
  LEFT JOIN bill_types bt_old ON (ral.old_data->>'bill_type_id')::uuid = bt_old.id
  LEFT JOIN bill_types bt_new ON (ral.new_data->>'bill_type_id')::uuid = bt_new.id
  LEFT JOIN profiles cb_p ON ral.changed_by = cb_p.id
  LEFT JOIN general_information cb_gi ON cb_p.id = cb_gi.profile_id;
  
  -- Build final result JSON
  SELECT json_build_object(
    'audit_logs', COALESCE(audit_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO audit_data;
  
  RETURN audit_data;
END;
$$;