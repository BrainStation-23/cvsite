
-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_resource_planning_data(text, integer, integer, text, text, uuid, uuid);
DROP FUNCTION IF EXISTS public.get_weekly_validation_data(text, integer, integer, text, text, uuid, uuid);
DROP FUNCTION IF EXISTS public.get_unplanned_resources(text, uuid, uuid);

-- Create comprehensive resource planning function with all filters
CREATE OR REPLACE FUNCTION public.get_comprehensive_resource_planning_data(
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
  end_date_to date DEFAULT NULL,
  include_unplanned boolean DEFAULT FALSE,
  include_weekly_validation boolean DEFAULT FALSE
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  resource_planning_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  resource_planning_array JSON;
  base_where_clause TEXT;
  count_query TEXT;
  final_query TEXT;
BEGIN
  -- Build base WHERE clause
  base_where_clause := '
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN profiles manager_p ON p.manager = manager_p.id
    LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
    WHERE 1=1';

  -- Add search query filter
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    base_where_clause := base_where_clause || '
      AND (
        p.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR p.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR p.employee_id ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR gi.current_designation ILIKE ' || quote_literal('%' || search_query || '%') || '
        OR s.name ILIKE ' || quote_literal('%' || search_query || '%') || '
      )';
  END IF;

  -- Add SBU filter
  IF sbu_filter IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND p.sbu_id = ' || quote_literal(sbu_filter);
  END IF;

  -- Add manager filter
  IF manager_filter IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND p.manager = ' || quote_literal(manager_filter);
  END IF;

  -- Add bill type filter
  IF bill_type_filter IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.bill_type_id = ' || quote_literal(bill_type_filter);
  END IF;

  -- Add project search filter
  IF project_search IS NOT NULL AND trim(project_search) != '' THEN
    base_where_clause := base_where_clause || '
      AND (
        pm.project_name ILIKE ' || quote_literal('%' || project_search || '%') || '
        OR pm.client_name ILIKE ' || quote_literal('%' || project_search || '%') || '
      )';
  END IF;

  -- Add engagement percentage range filters
  IF min_engagement_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.engagement_percentage >= ' || min_engagement_percentage;
  END IF;

  IF max_engagement_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.engagement_percentage <= ' || max_engagement_percentage;
  END IF;

  -- Add billing percentage range filters
  IF min_billing_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.billing_percentage >= ' || min_billing_percentage;
  END IF;

  IF max_billing_percentage IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.billing_percentage <= ' || max_billing_percentage;
  END IF;

  -- Add start date range filters
  IF start_date_from IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.engagement_start_date >= ' || quote_literal(start_date_from);
  END IF;

  IF start_date_to IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.engagement_start_date <= ' || quote_literal(start_date_to);
  END IF;

  -- Add end date range filters
  IF end_date_from IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.release_date >= ' || quote_literal(end_date_from);
  END IF;

  IF end_date_to IS NOT NULL THEN
    base_where_clause := base_where_clause || '
      AND rp.release_date <= ' || quote_literal(end_date_to);
  END IF;

  -- Add unplanned filter (resources without project assignment)
  IF include_unplanned = TRUE THEN
    base_where_clause := base_where_clause || '
      AND rp.project_id IS NULL';
  ELSE
    -- For planned resources, we want those with project assignments
    base_where_clause := base_where_clause || '
      AND rp.project_id IS NOT NULL';
  END IF;

  -- Simple total count (all resource planning records)
  SELECT COUNT(*) INTO total_count FROM resource_planning;

  -- Count filtered results
  count_query := 'SELECT COUNT(DISTINCT rp.id) ' || base_where_clause;
  EXECUTE count_query INTO filtered_count;

  -- Build final query for data
  final_query := '
    SELECT json_agg(
      json_build_object(
        ''id'', rp.id,
        ''profile_id'', rp.profile_id,
        ''engagement_percentage'', rp.engagement_percentage,
        ''billing_percentage'', rp.billing_percentage,
        ''release_date'', rp.release_date,
        ''engagement_start_date'', rp.engagement_start_date,
        ''engagement_complete'', rp.engagement_complete,
        ''created_at'', rp.created_at,
        ''updated_at'', rp.updated_at' ||
        CASE WHEN include_weekly_validation THEN ',
        ''weekly_validation'', rp.weekly_validation'
        ELSE ''
        END || ',
        ''profile'', json_build_object(
          ''id'', p.id,
          ''employee_id'', p.employee_id,
          ''first_name'', COALESCE(gi.first_name, p.first_name),
          ''last_name'', COALESCE(gi.last_name, p.last_name),
          ''current_designation'', gi.current_designation
        ),
        ''bill_type'', CASE 
          WHEN bt.id IS NOT NULL THEN json_build_object(
            ''id'', bt.id,
            ''name'', bt.name
          )
          ELSE NULL
        END,
        ''project'', CASE 
          WHEN pm.id IS NOT NULL THEN json_build_object(
            ''id'', pm.id,
            ''project_name'', pm.project_name,
            ''project_manager'', CASE 
              WHEN manager_p.id IS NOT NULL THEN 
                COALESCE(manager_gi.first_name, manager_p.first_name) || '' '' || COALESCE(manager_gi.last_name, manager_p.last_name)
              ELSE ''Unassigned''
            END,
            ''client_name'', pm.client_name,
            ''budget'', pm.budget
          )
          ELSE NULL
        END
      )
      ORDER BY
        CASE WHEN ''' || sort_by || ''' = ''created_at'' AND ''' || sort_order || ''' = ''asc'' THEN rp.created_at END ASC,
        CASE WHEN ''' || sort_by || ''' = ''created_at'' AND ''' || sort_order || ''' = ''desc'' THEN rp.created_at END DESC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_start_date'' AND ''' || sort_order || ''' = ''asc'' THEN rp.engagement_start_date END ASC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_start_date'' AND ''' || sort_order || ''' = ''desc'' THEN rp.engagement_start_date END DESC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''asc'' THEN rp.release_date END ASC,
        CASE WHEN ''' || sort_by || ''' = ''release_date'' AND ''' || sort_order || ''' = ''desc'' THEN rp.release_date END DESC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_percentage'' AND ''' || sort_order || ''' = ''asc'' THEN rp.engagement_percentage END ASC,
        CASE WHEN ''' || sort_by || ''' = ''engagement_percentage'' AND ''' || sort_order || ''' = ''desc'' THEN rp.engagement_percentage END DESC,
        rp.created_at DESC
    ) ' || base_where_clause;

  -- Add pagination
  IF items_per_page > 0 THEN
    final_query := final_query || '
      LIMIT ' || items_per_page || '
      OFFSET ' || (page_number - 1) * items_per_page;
  END IF;

  -- Execute the final query
  EXECUTE final_query INTO resource_planning_array;

  -- Build final result
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE 
        WHEN items_per_page > 0 AND filtered_count > 0 THEN 
          CEIL(filtered_count::numeric / items_per_page) 
        ELSE 0 
      END
    )
  ) INTO resource_planning_data;

  RETURN resource_planning_data;
END;
$function$;
