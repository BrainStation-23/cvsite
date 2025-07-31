
-- Drop the overly complex function
DROP FUNCTION IF EXISTS public.get_comprehensive_resource_planning_data;

-- Create separate RPC function for planned resources
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
  query_text text;
  count_query_text text;
  where_conditions text[];
  where_clause text;
  order_clause text;
BEGIN
  -- Build WHERE conditions array (only for planned resources with projects)
  where_conditions := ARRAY['rp.project_id IS NOT NULL'];

  -- Add other filters
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    where_conditions := array_append(where_conditions, 
      '(p.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.last_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.employee_id ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.last_name ILIKE ''%' || search_query || '%'')');
  END IF;

  IF sbu_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 's.name ILIKE ''%' || sbu_filter || '%''');
  END IF;

  IF manager_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      '(mp.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mp.last_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.last_name ILIKE ''%' || manager_filter || '%'')');
  END IF;

  IF bill_type_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'bt.name ILIKE ''%' || bill_type_filter || '%''');
  END IF;

  IF project_search IS NOT NULL AND trim(project_search) != '' THEN
    where_conditions := array_append(where_conditions, 'proj.project_name ILIKE ''%' || project_search || '%''');
  END IF;

  IF min_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage >= ' || min_engagement_percentage);
  END IF;
  
  IF max_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage <= ' || max_engagement_percentage);
  END IF;

  IF min_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage >= ' || min_billing_percentage);
  END IF;
  
  IF max_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage <= ' || max_billing_percentage);
  END IF;

  IF start_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date >= ''' || start_date_from || '''');
  END IF;
  
  IF start_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date <= ''' || start_date_to || '''');
  END IF;
  
  IF end_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date >= ''' || end_date_from || '''');
  END IF;
  
  IF end_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date <= ''' || end_date_to || '''');
  END IF;

  where_clause := array_to_string(where_conditions, ' AND ');

  -- Build ORDER BY clause
  order_clause := 'ORDER BY ';
  CASE 
    WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'rp.created_at ASC';
    WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'rp.created_at DESC';
    WHEN sort_by = 'employee_name' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) ASC';
    WHEN sort_by = 'employee_name' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) DESC';
    ELSE
      order_clause := order_clause || 'rp.created_at DESC';
  END CASE;

  -- Count total planned resources
  SELECT COUNT(*) INTO total_count FROM resource_planning WHERE project_id IS NOT NULL;

  -- Count filtered records
  count_query_text := 'SELECT COUNT(*) FROM resource_planning rp ' ||
    'LEFT JOIN profiles p ON rp.profile_id = p.id ' ||
    'LEFT JOIN general_information gi ON p.id = gi.profile_id ' ||
    'LEFT JOIN sbus s ON p.sbu_id = s.id ' ||
    'LEFT JOIN profiles mp ON p.manager = mp.id ' ||
    'LEFT JOIN general_information mgi ON mp.id = mgi.profile_id ' ||
    'LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id ' ||
    'LEFT JOIN projects_management proj ON rp.project_id = proj.id ' ||
    'WHERE ' || where_clause;

  EXECUTE count_query_text INTO filtered_count;

  -- Build main query
  query_text := 'SELECT json_agg(
    json_build_object(
      ''id'', rp.id,
      ''profile_id'', rp.profile_id,
      ''project_id'', rp.project_id,
      ''bill_type_id'', rp.bill_type_id,
      ''engagement_percentage'', rp.engagement_percentage,
      ''billing_percentage'', rp.billing_percentage,
      ''engagement_start_date'', rp.engagement_start_date,
      ''release_date'', rp.release_date,
      ''engagement_complete'', rp.engagement_complete,
      ''weekly_validation'', rp.weekly_validation,
      ''created_at'', rp.created_at,
      ''updated_at'', rp.updated_at,
      ''profile'', json_build_object(
        ''id'', p.id,
        ''employee_id'', p.employee_id,
        ''first_name'', COALESCE(gi.first_name, p.first_name),
        ''last_name'', COALESCE(gi.last_name, p.last_name),
        ''current_designation'', gi.current_designation
      ),
      ''bill_type'', CASE WHEN bt.id IS NOT NULL THEN 
        json_build_object(
          ''id'', bt.id,
          ''name'', bt.name
        )
      ELSE NULL END,
      ''project'', json_build_object(
        ''id'', proj.id,
        ''project_name'', proj.project_name,
        ''project_manager'', proj.project_manager,
        ''client_name'', proj.client_name,
        ''budget'', proj.budget
      ),
      ''sbu'', CASE WHEN s.id IS NOT NULL THEN 
        json_build_object(
          ''id'', s.id,
          ''name'', s.name
        )
      ELSE NULL END
    )
  ) FROM (
    SELECT rp.*, p.*, gi.*, bt.*, proj.*, s.*
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mp ON p.manager = mp.id
    LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management proj ON rp.project_id = proj.id
    WHERE ' || where_clause || ' ' ||
    order_clause || ' ' ||
    'LIMIT ' || items_per_page || ' OFFSET ' || (page_number - 1) * items_per_page ||
  ') AS filtered_data';

  EXECUTE query_text INTO result_data;

  RETURN json_build_object(
    'resource_planning', COALESCE(result_data, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  );
END;
$$;

-- Create separate RPC function for unplanned resources
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
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
  query_text text;
  count_query_text text;
  where_conditions text[];
  where_clause text;
  order_clause text;
BEGIN
  -- Build WHERE conditions array (only for unplanned resources without projects)
  where_conditions := ARRAY['rp.project_id IS NULL'];

  -- Add other filters
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    where_conditions := array_append(where_conditions, 
      '(p.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.last_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.employee_id ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.last_name ILIKE ''%' || search_query || '%'')');
  END IF;

  IF sbu_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 's.name ILIKE ''%' || sbu_filter || '%''');
  END IF;

  IF manager_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      '(mp.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mp.last_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.last_name ILIKE ''%' || manager_filter || '%'')');
  END IF;

  IF bill_type_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'bt.name ILIKE ''%' || bill_type_filter || '%''');
  END IF;

  -- Note: project_search is not applicable for unplanned resources

  IF min_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage >= ' || min_engagement_percentage);
  END IF;
  
  IF max_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage <= ' || max_engagement_percentage);
  END IF;

  IF min_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage >= ' || min_billing_percentage);
  END IF;
  
  IF max_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage <= ' || max_billing_percentage);
  END IF;

  IF start_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date >= ''' || start_date_from || '''');
  END IF;
  
  IF start_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date <= ''' || start_date_to || '''');
  END IF;
  
  IF end_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date >= ''' || end_date_from || '''');
  END IF;
  
  IF end_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date <= ''' || end_date_to || '''');
  END IF;

  where_clause := array_to_string(where_conditions, ' AND ');

  -- Build ORDER BY clause
  order_clause := 'ORDER BY ';
  CASE 
    WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'rp.created_at ASC';
    WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'rp.created_at DESC';
    WHEN sort_by = 'employee_name' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) ASC';
    WHEN sort_by = 'employee_name' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) DESC';
    ELSE
      order_clause := order_clause || 'rp.created_at DESC';
  END CASE;

  -- Count total unplanned resources
  SELECT COUNT(*) INTO total_count FROM resource_planning WHERE project_id IS NULL;

  -- Count filtered records
  count_query_text := 'SELECT COUNT(*) FROM resource_planning rp ' ||
    'LEFT JOIN profiles p ON rp.profile_id = p.id ' ||
    'LEFT JOIN general_information gi ON p.id = gi.profile_id ' ||
    'LEFT JOIN sbus s ON p.sbu_id = s.id ' ||
    'LEFT JOIN profiles mp ON p.manager = mp.id ' ||
    'LEFT JOIN general_information mgi ON mp.id = mgi.profile_id ' ||
    'LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id ' ||
    'WHERE ' || where_clause;

  EXECUTE count_query_text INTO filtered_count;

  -- Build main query
  query_text := 'SELECT json_agg(
    json_build_object(
      ''id'', rp.id,
      ''profile_id'', rp.profile_id,
      ''project_id'', rp.project_id,
      ''bill_type_id'', rp.bill_type_id,
      ''engagement_percentage'', rp.engagement_percentage,
      ''billing_percentage'', rp.billing_percentage,
      ''engagement_start_date'', rp.engagement_start_date,
      ''release_date'', rp.release_date,
      ''engagement_complete'', rp.engagement_complete,
      ''weekly_validation'', rp.weekly_validation,
      ''created_at'', rp.created_at,
      ''updated_at'', rp.updated_at,
      ''profile'', json_build_object(
        ''id'', p.id,
        ''employee_id'', p.employee_id,
        ''first_name'', COALESCE(gi.first_name, p.first_name),
        ''last_name'', COALESCE(gi.last_name, p.last_name),
        ''current_designation'', gi.current_designation
      ),
      ''bill_type'', CASE WHEN bt.id IS NOT NULL THEN 
        json_build_object(
          ''id'', bt.id,
          ''name'', bt.name
        )
      ELSE NULL END,
      ''project'', NULL,
      ''sbu'', CASE WHEN s.id IS NOT NULL THEN 
        json_build_object(
          ''id'', s.id,
          ''name'', s.name
        )
      ELSE NULL END
    )
  ) FROM (
    SELECT rp.*, p.*, gi.*, bt.*, s.*
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mp ON p.manager = mp.id
    LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    WHERE ' || where_clause || ' ' ||
    order_clause || ' ' ||
    'LIMIT ' || items_per_page || ' OFFSET ' || (page_number - 1) * items_per_page ||
  ') AS filtered_data';

  EXECUTE query_text INTO result_data;

  RETURN json_build_object(
    'unplanned_resources', COALESCE(result_data, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  );
END;
$$;

-- Create separate RPC function for weekly validation
CREATE OR REPLACE FUNCTION public.get_weekly_validation_resources(
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
  query_text text;
  count_query_text text;
  where_conditions text[];
  where_clause text;
  order_clause text;
BEGIN
  -- Build WHERE conditions array (only for resources that need weekly validation)
  where_conditions := ARRAY['rp.weekly_validation = false OR rp.weekly_validation IS NULL'];

  -- Add other filters
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    where_conditions := array_append(where_conditions, 
      '(p.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.last_name ILIKE ''%' || search_query || '%'' OR ' ||
      'p.employee_id ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.first_name ILIKE ''%' || search_query || '%'' OR ' ||
      'gi.last_name ILIKE ''%' || search_query || '%'')');
  END IF;

  IF sbu_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 's.name ILIKE ''%' || sbu_filter || '%''');
  END IF;

  IF manager_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      '(mp.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mp.last_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.first_name ILIKE ''%' || manager_filter || '%'' OR ' ||
      'mgi.last_name ILIKE ''%' || manager_filter || '%'')');
  END IF;

  IF bill_type_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'bt.name ILIKE ''%' || bill_type_filter || '%''');
  END IF;

  IF project_search IS NOT NULL AND trim(project_search) != '' THEN
    where_conditions := array_append(where_conditions, 'proj.project_name ILIKE ''%' || project_search || '%''');
  END IF;

  IF min_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage >= ' || min_engagement_percentage);
  END IF;
  
  IF max_engagement_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_percentage <= ' || max_engagement_percentage);
  END IF;

  IF min_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage >= ' || min_billing_percentage);
  END IF;
  
  IF max_billing_percentage IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.billing_percentage <= ' || max_billing_percentage);
  END IF;

  IF start_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date >= ''' || start_date_from || '''');
  END IF;
  
  IF start_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.engagement_start_date <= ''' || start_date_to || '''');
  END IF;
  
  IF end_date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date >= ''' || end_date_from || '''');
  END IF;
  
  IF end_date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 'rp.release_date <= ''' || end_date_to || '''');
  END IF;

  where_clause := array_to_string(where_conditions, ' AND ');

  -- Build ORDER BY clause
  order_clause := 'ORDER BY ';
  CASE 
    WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'rp.created_at ASC';
    WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'rp.created_at DESC';
    WHEN sort_by = 'employee_name' AND sort_order = 'asc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) ASC';
    WHEN sort_by = 'employee_name' AND sort_order = 'desc' THEN
      order_clause := order_clause || 'COALESCE(gi.first_name, p.first_name), COALESCE(gi.last_name, p.last_name) DESC';
    ELSE
      order_clause := order_clause || 'rp.created_at DESC';
  END CASE;

  -- Count total resources needing weekly validation
  SELECT COUNT(*) INTO total_count FROM resource_planning WHERE weekly_validation = false OR weekly_validation IS NULL;

  -- Count filtered records
  count_query_text := 'SELECT COUNT(*) FROM resource_planning rp ' ||
    'LEFT JOIN profiles p ON rp.profile_id = p.id ' ||
    'LEFT JOIN general_information gi ON p.id = gi.profile_id ' ||
    'LEFT JOIN sbus s ON p.sbu_id = s.id ' ||
    'LEFT JOIN profiles mp ON p.manager = mp.id ' ||
    'LEFT JOIN general_information mgi ON mp.id = mgi.profile_id ' ||
    'LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id ' ||
    'LEFT JOIN projects_management proj ON rp.project_id = proj.id ' ||
    'WHERE ' || where_clause;

  EXECUTE count_query_text INTO filtered_count;

  -- Build main query
  query_text := 'SELECT json_agg(
    json_build_object(
      ''id'', rp.id,
      ''profile_id'', rp.profile_id,
      ''project_id'', rp.project_id,
      ''bill_type_id'', rp.bill_type_id,
      ''engagement_percentage'', rp.engagement_percentage,
      ''billing_percentage'', rp.billing_percentage,
      ''engagement_start_date'', rp.engagement_start_date,
      ''release_date'', rp.release_date,
      ''engagement_complete'', rp.engagement_complete,
      ''weekly_validation'', rp.weekly_validation,
      ''created_at'', rp.created_at,
      ''updated_at'', rp.updated_at,
      ''profile'', json_build_object(
        ''id'', p.id,
        ''employee_id'', p.employee_id,
        ''first_name'', COALESCE(gi.first_name, p.first_name),
        ''last_name'', COALESCE(gi.last_name, p.last_name),
        ''current_designation'', gi.current_designation
      ),
      ''bill_type'', CASE WHEN bt.id IS NOT NULL THEN 
        json_build_object(
          ''id'', bt.id,
          ''name'', bt.name
        )
      ELSE NULL END,
      ''project'', CASE WHEN proj.id IS NOT NULL THEN 
        json_build_object(
          ''id'', proj.id,
          ''project_name'', proj.project_name,
          ''project_manager'', proj.project_manager,
          ''client_name'', proj.client_name,
          ''budget'', proj.budget
        )
      ELSE NULL END,
      ''sbu'', CASE WHEN s.id IS NOT NULL THEN 
        json_build_object(
          ''id'', s.id,
          ''name'', s.name
        )
      ELSE NULL END
    )
  ) FROM (
    SELECT rp.*, p.*, gi.*, bt.*, proj.*, s.*
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mp ON p.manager = mp.id
    LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management proj ON rp.project_id = proj.id
    WHERE ' || where_clause || ' ' ||
    order_clause || ' ' ||
    'LIMIT ' || items_per_page || ' OFFSET ' || (page_number - 1) * items_per_page ||
  ') AS filtered_data';

  EXECUTE query_text INTO result_data;

  RETURN json_build_object(
    'resource_planning', COALESCE(result_data, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  );
END;
$$;
