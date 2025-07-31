
-- Create RPC function for planned resources
CREATE OR REPLACE FUNCTION public.get_planned_resources(
  search_query text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at'::text,
  sort_order text DEFAULT 'desc'::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text,
  bill_type_filter text DEFAULT NULL::text,
  project_search text DEFAULT NULL::text,
  min_engagement_percentage real DEFAULT NULL::real,
  max_engagement_percentage real DEFAULT NULL::real,
  min_billing_percentage real DEFAULT NULL::real,
  max_billing_percentage real DEFAULT NULL::real,
  start_date_from text DEFAULT NULL::text,
  start_date_to text DEFAULT NULL::text,
  end_date_from text DEFAULT NULL::text,
  end_date_to text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
  total_count integer;
  filtered_count integer;
BEGIN
  -- Get total count
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  WHERE rp.project_id IS NOT NULL;

  -- Build the main query with filters
  WITH filtered_resources AS (
    SELECT 
      rp.*,
      p.employee_id,
      p.first_name,
      p.last_name,
      gi.current_designation,
      bt.name as bill_type_name,
      pm.project_name,
      pm.project_manager,
      pm.client_name,
      pm.budget
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE rp.project_id IS NOT NULL
      AND (search_query IS NULL OR 
           p.first_name ILIKE '%' || search_query || '%' OR
           p.last_name ILIKE '%' || search_query || '%' OR
           p.employee_id ILIKE '%' || search_query || '%' OR
           pm.project_name ILIKE '%' || search_query || '%')
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (manager_filter IS NULL OR pm.project_manager ILIKE '%' || manager_filter || '%')
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  )
  SELECT 
    json_build_object(
      'resource_planning', (
        SELECT json_agg(
          json_build_object(
            'id', fr.id,
            'profile_id', fr.profile_id,
            'engagement_percentage', fr.engagement_percentage,
            'billing_percentage', fr.billing_percentage,
            'release_date', fr.release_date,
            'engagement_start_date', fr.engagement_start_date,
            'engagement_complete', fr.engagement_complete,
            'weekly_validation', fr.weekly_validation,
            'created_at', fr.created_at,
            'updated_at', fr.updated_at,
            'profile', json_build_object(
              'id', fr.profile_id,
              'employee_id', fr.employee_id,
              'first_name', fr.first_name,
              'last_name', fr.last_name,
              'current_designation', fr.current_designation
            ),
            'bill_type', CASE WHEN fr.bill_type_name IS NOT NULL THEN
              json_build_object(
                'id', fr.bill_type_id,
                'name', fr.bill_type_name
              ) ELSE NULL END,
            'project', json_build_object(
              'id', fr.project_id,
              'project_name', fr.project_name,
              'project_manager', fr.project_manager,
              'client_name', fr.client_name,
              'budget', fr.budget
            )
          )
          ORDER BY
            CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN fr.created_at END ASC,
            CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN fr.created_at END DESC,
            CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN fr.first_name END ASC,
            CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN fr.first_name END DESC,
            CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN fr.project_name END ASC,
            CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN fr.project_name END DESC
          LIMIT items_per_page
          OFFSET (page_number - 1) * items_per_page
        )
        FROM filtered_resources fr
      ),
      'pagination', json_build_object(
        'total_count', total_count,
        'filtered_count', (SELECT COUNT(*) FROM filtered_resources),
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL((SELECT COUNT(*) FROM filtered_resources)::numeric / items_per_page)
      )
    )
  INTO result;
  
  RETURN result;
END;
$function$;

-- Create RPC function for unplanned resources
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 100,
  sort_by text DEFAULT 'created_at'::text,
  sort_order text DEFAULT 'desc'::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
BEGIN
  WITH unplanned_profiles AS (
    SELECT DISTINCT
      p.id,
      p.employee_id,
      p.first_name,
      p.last_name,
      gi.current_designation,
      s.name as sbu_name
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE NOT EXISTS (
      SELECT 1 FROM resource_planning rp 
      WHERE rp.profile_id = p.id AND rp.project_id IS NOT NULL
    )
    AND (search_query IS NULL OR 
         p.first_name ILIKE '%' || search_query || '%' OR
         p.last_name ILIKE '%' || search_query || '%' OR
         p.employee_id ILIKE '%' || search_query || '%')
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
  )
  SELECT 
    json_build_object(
      'resource_planning', (
        SELECT json_agg(
          json_build_object(
            'id', up.id,
            'profile_id', up.id,
            'engagement_percentage', 0,
            'billing_percentage', 0,
            'release_date', null,
            'engagement_start_date', null,
            'engagement_complete', false,
            'weekly_validation', false,
            'created_at', null,
            'updated_at', null,
            'profile', json_build_object(
              'id', up.id,
              'employee_id', up.employee_id,
              'first_name', up.first_name,
              'last_name', up.last_name,
              'current_designation', up.current_designation
            ),
            'bill_type', null,
            'project', null
          )
          ORDER BY
            CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN up.first_name END ASC,
            CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN up.first_name END DESC,
            CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN up.last_name END ASC,
            CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN up.last_name END DESC,
            CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN up.employee_id END ASC,
            CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN up.employee_id END DESC
          LIMIT items_per_page
          OFFSET (page_number - 1) * items_per_page
        )
        FROM unplanned_profiles up
      ),
      'pagination', json_build_object(
        'total_count', (SELECT COUNT(*) FROM unplanned_profiles),
        'filtered_count', (SELECT COUNT(*) FROM unplanned_profiles),
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL((SELECT COUNT(*) FROM unplanned_profiles)::numeric / items_per_page)
      )
    )
  INTO result;
  
  RETURN result;
END;
$function$;

-- Create RPC function for weekly validation resources
CREATE OR REPLACE FUNCTION public.get_weekly_validation_resources(
  search_query text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 100,
  sort_by text DEFAULT 'created_at'::text,
  sort_order text DEFAULT 'desc'::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text,
  bill_type_filter text DEFAULT NULL::text,
  project_search text DEFAULT NULL::text,
  min_engagement_percentage real DEFAULT NULL::real,
  max_engagement_percentage real DEFAULT NULL::real,
  min_billing_percentage real DEFAULT NULL::real,
  max_billing_percentage real DEFAULT NULL::real,
  start_date_from text DEFAULT NULL::text,
  start_date_to text DEFAULT NULL::text,
  end_date_from text DEFAULT NULL::text,
  end_date_to text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
  total_count integer;
BEGIN
  -- Get total count of records needing validation
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp
  WHERE rp.weekly_validation = false OR rp.weekly_validation IS NULL;

  -- Build the main query with filters for weekly validation
  WITH validation_resources AS (
    SELECT 
      rp.*,
      p.employee_id,
      p.first_name,
      p.last_name,
      gi.current_designation,
      bt.name as bill_type_name,
      pm.project_name,
      pm.project_manager,
      pm.client_name,
      pm.budget
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE (rp.weekly_validation = false OR rp.weekly_validation IS NULL)
      AND (search_query IS NULL OR 
           p.first_name ILIKE '%' || search_query || '%' OR
           p.last_name ILIKE '%' || search_query || '%' OR
           p.employee_id ILIKE '%' || search_query || '%' OR
           pm.project_name ILIKE '%' || search_query || '%')
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (manager_filter IS NULL OR pm.project_manager ILIKE '%' || manager_filter || '%')
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (project_search IS NULL OR pm.project_name ILIKE '%' || project_search || '%')
      AND (min_engagement_percentage IS NULL OR rp.engagement_percentage >= min_engagement_percentage)
      AND (max_engagement_percentage IS NULL OR rp.engagement_percentage <= max_engagement_percentage)
      AND (min_billing_percentage IS NULL OR rp.billing_percentage >= min_billing_percentage)
      AND (max_billing_percentage IS NULL OR rp.billing_percentage <= max_billing_percentage)
      AND (start_date_from IS NULL OR rp.engagement_start_date >= start_date_from::date)
      AND (start_date_to IS NULL OR rp.engagement_start_date <= start_date_to::date)
      AND (end_date_from IS NULL OR rp.release_date >= end_date_from::date)
      AND (end_date_to IS NULL OR rp.release_date <= end_date_to::date)
  )
  SELECT 
    json_build_object(
      'resource_planning', (
        SELECT json_agg(
          json_build_object(
            'id', vr.id,
            'profile_id', vr.profile_id,
            'engagement_percentage', vr.engagement_percentage,
            'billing_percentage', vr.billing_percentage,
            'release_date', vr.release_date,
            'engagement_start_date', vr.engagement_start_date,
            'engagement_complete', vr.engagement_complete,
            'weekly_validation', vr.weekly_validation,
            'created_at', vr.created_at,
            'updated_at', vr.updated_at,
            'profile', json_build_object(
              'id', vr.profile_id,
              'employee_id', vr.employee_id,
              'first_name', vr.first_name,
              'last_name', vr.last_name,
              'current_designation', vr.current_designation
            ),
            'bill_type', CASE WHEN vr.bill_type_name IS NOT NULL THEN
              json_build_object(
                'id', vr.bill_type_id,
                'name', vr.bill_type_name
              ) ELSE NULL END,
            'project', CASE WHEN vr.project_name IS NOT NULL THEN
              json_build_object(
                'id', vr.project_id,
                'project_name', vr.project_name,
                'project_manager', vr.project_manager,
                'client_name', vr.client_name,
                'budget', vr.budget
              ) ELSE NULL END
          )
          ORDER BY
            CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN vr.created_at END ASC,
            CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN vr.created_at END DESC,
            CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN vr.first_name END ASC,
            CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN vr.first_name END DESC,
            CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN vr.project_name END ASC,
            CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN vr.project_name END DESC
          LIMIT items_per_page
          OFFSET (page_number - 1) * items_per_page
        )
        FROM validation_resources vr
      ),
      'pagination', json_build_object(
        'total_count', total_count,
        'filtered_count', (SELECT COUNT(*) FROM validation_resources),
        'page', page_number,
        'per_page', items_per_page,
        'page_count', CEIL((SELECT COUNT(*) FROM validation_resources)::numeric / items_per_page)
      )
    )
  INTO result;
  
  RETURN result;
END;
$function$;
