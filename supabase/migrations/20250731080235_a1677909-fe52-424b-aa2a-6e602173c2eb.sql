
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_comprehensive_resource_planning_data(
  TEXT, INT, INT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, REAL, REAL, REAL, REAL, DATE, DATE, DATE, DATE, BOOLEAN, BOOLEAN
);

-- Recreate the function without include_unplanned parameter
CREATE OR REPLACE FUNCTION public.get_comprehensive_resource_planning_data(
  search_query TEXT DEFAULT NULL,
  page_number INT DEFAULT 1,
  items_per_page INT DEFAULT 10,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc',
  sbu_filter TEXT DEFAULT NULL,
  manager_filter TEXT DEFAULT NULL,
  bill_type_filter TEXT DEFAULT NULL,
  project_search TEXT DEFAULT NULL,
  min_engagement_percentage REAL DEFAULT NULL,
  max_engagement_percentage REAL DEFAULT NULL,
  min_billing_percentage REAL DEFAULT NULL,
  max_billing_percentage REAL DEFAULT NULL,
  start_date_from DATE DEFAULT NULL,
  start_date_to DATE DEFAULT NULL,
  end_date_from DATE DEFAULT NULL,
  end_date_to DATE DEFAULT NULL,
  include_weekly_validation BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  base_query TEXT;
  count_query TEXT;
  final_query TEXT;
  base_where_clause TEXT := '';
  total_count INT;
  filtered_count INT;
  resource_planning_data JSON;
BEGIN
  -- Base query for planned resources only
  base_query := '
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN profiles mgr_profile ON p.manager = mgr_profile.id
    LEFT JOIN general_information mgr_gi ON mgr_profile.id = mgr_gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE 1=1 AND rp.project_id IS NOT NULL';

  -- Add weekly validation filter
  IF include_weekly_validation = TRUE THEN
    base_where_clause := base_where_clause || ' AND rp.weekly_validation = TRUE';
  ELSE
    base_where_clause := base_where_clause || ' AND (rp.weekly_validation IS NULL OR rp.weekly_validation = FALSE)';
  END IF;

  -- Add search filter
  IF search_query IS NOT NULL AND search_query != '' THEN
    base_where_clause := base_where_clause || '
      AND (
        COALESCE(gi.first_name, p.first_name) ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR COALESCE(gi.last_name, p.last_name) ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR p.employee_id ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR bt.name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR pm.project_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR pm.client_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR s.name ILIKE ' || quote_literal('%' || search_query || '%') || '
      )';
  END IF;

  -- Add SBU filter
  IF sbu_filter IS NOT NULL AND sbu_filter != '' THEN
    base_where_clause := base_where_clause || ' AND s.name ILIKE ' || quote_literal('%' || sbu_filter || '%');
  END IF;

  -- Add manager filter
  IF manager_filter IS NOT NULL AND manager_filter != '' THEN
    base_where_clause := base_where_clause || ' AND (
      COALESCE(mgr_gi.first_name, mgr_profile.first_name) ILIKE ' || quote_literal('%' || manager_filter || '%') || '
      OR COALESCE(mgr_gi.last_name, mgr_profile.last_name) ILIKE ' || quote_literal('%' || manager_filter || '%') || '
    )';
  END IF;

  -- Add bill type filter
  IF bill_type_filter IS NOT NULL AND bill_type_filter != '' THEN
    base_where_clause := base_where_clause || ' AND bt.name ILIKE ' || quote_literal('%' || bill_type_filter || '%');
  END IF;

  -- Add project search filter
  IF project_search IS NOT NULL AND project_search != '' THEN
    base_where_clause := base_where_clause || ' AND (
      pm.project_name ILIKE ' || quote_literal('%' || project_search || '%') || '
      OR pm.client_name ILIKE ' || quote_literal('%' || project_search || '%') || '
    )';
  END IF;

  -- Add engagement percentage filters
  IF min_engagement_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.engagement_percentage >= ' || min_engagement_percentage;
  END IF;
  
  IF max_engagement_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.engagement_percentage <= ' || max_engagement_percentage;
  END IF;

  -- Add billing percentage filters
  IF min_billing_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.billing_percentage >= ' || min_billing_percentage;
  END IF;
  
  IF max_billing_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.billing_percentage <= ' || max_billing_percentage;
  END IF;

  -- Add date filters
  IF start_date_from IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.engagement_start_date >= ' || quote_literal(start_date_from);
  END IF;

  IF start_date_to IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.engagement_start_date <= ' || quote_literal(start_date_to);
  END IF;

  IF end_date_from IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.release_date >= ' || quote_literal(end_date_from);
  END IF;

  IF end_date_to IS NOT NULL THEN
    base_where_clause := base_where_clause || ' AND rp.release_date <= ' || quote_literal(end_date_to);
  END IF;

  -- Get total count (without pagination)
  count_query := 'SELECT COUNT(DISTINCT rp.id) ' || base_query || base_where_clause;
  EXECUTE count_query INTO total_count;
  filtered_count := total_count;

  -- Build final query with pagination and sorting
  final_query := '
    SELECT json_agg(row_to_json(resource_data))
    FROM (
      SELECT DISTINCT
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
          ''id'', p.id,
          ''employee_id'', p.employee_id,
          ''first_name'', COALESCE(gi.first_name, p.first_name),
          ''last_name'', COALESCE(gi.last_name, p.last_name),
          ''current_designation'', gi.current_designation
        ) as profile,
        CASE 
          WHEN bt.id IS NOT NULL THEN 
            json_build_object(
              ''id'', bt.id,
              ''name'', bt.name
            )
          ELSE NULL
        END as bill_type,
        CASE 
          WHEN pm.id IS NOT NULL THEN 
            json_build_object(
              ''id'', pm.id,
              ''project_name'', pm.project_name,
              ''project_manager'', pm.project_manager,
              ''client_name'', pm.client_name,
              ''budget'', pm.budget
            )
          ELSE NULL
        END as project
      ' || base_query || base_where_clause || '
      ORDER BY
        CASE WHEN ''' || sort_by || ''' = ''created_at'' AND ''' || sort_order || ''' = ''asc'' THEN rp.created_at END ASC,
        CASE WHEN ''' || sort_by || ''' = ''created_at'' AND ''' || sort_order || ''' = ''desc'' THEN rp.created_at END DESC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_start_date'' AND ''' || sort_order || ''' = ''asc'' THEN rp.engagement_start_date END ASC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_start_date'' AND ''' || sort_order || ''' = ''desc'' THEN rp.engagement_start_date END DESC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''asc'' THEN rp.release_date END ASC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''desc'' THEN rp.release_date END DESC,
        rp.created_at DESC
      LIMIT ' || items_per_page || '
      OFFSET ' || (page_number - 1) * items_per_page || '
    ) as resource_data';

  -- Execute the final query
  EXECUTE final_query INTO resource_planning_data;

  -- Build final result
  result := json_build_object(
    'resource_planning', COALESCE(resource_planning_data, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  );

  RETURN result;
END;
$function$;
