
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sbu_filter uuid DEFAULT NULL,
  manager_filter uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  total_count integer;
  filtered_count integer;
  unplanned_array json;
BEGIN
  -- Calculate total unplanned resources count (unfiltered)
  WITH cumulative_engagement AS (
    SELECT 
      p.id as profile_id,
      COALESCE(SUM(rp.engagement_percentage), 0) as total_engagement
    FROM profiles p
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id 
      AND (rp.engagement_complete = false OR rp.engagement_complete IS NULL)
    GROUP BY p.id
  )
  SELECT COUNT(*)
  INTO total_count
  FROM cumulative_engagement ce
  WHERE ce.total_engagement < 51;

  -- Count filtered results
  WITH cumulative_engagement AS (
    SELECT 
      p.id as profile_id,
      COALESCE(SUM(rp.engagement_percentage), 0) as total_engagement
    FROM profiles p
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id 
      AND (rp.engagement_complete = false OR rp.engagement_complete IS NULL)
    GROUP BY p.id
  )
  SELECT COUNT(*)
  INTO filtered_count
  FROM cumulative_engagement ce
  JOIN profiles p ON ce.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE ce.total_engagement < 51
  AND (
    search_query IS NULL 
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR gi.current_designation ILIKE '%' || search_query || '%'
    OR s.name ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  AND (manager_filter IS NULL OR p.manager = manager_filter);

  -- Get paginated results with all resource planning details
  WITH cumulative_engagement AS (
    SELECT 
      p.id as profile_id,
      COALESCE(SUM(rp.engagement_percentage), 0) as total_engagement
    FROM profiles p
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id 
      AND (rp.engagement_complete = false OR rp.engagement_complete IS NULL)
    GROUP BY p.id
  ),
  filtered_profiles AS (
    SELECT 
      p.*,
      ce.total_engagement,
      gi.first_name as gi_first_name,
      gi.last_name as gi_last_name,
      gi.current_designation,
      gi.profile_image,
      gi.biography,
      s.id as sbu_id,
      s.name as sbu_name,
      s.sbu_head_email,
      manager.id as manager_id,
      manager.employee_id as manager_employee_id,
      manager_gi.first_name as manager_first_name,
      manager_gi.last_name as manager_last_name,
      et.id as expertise_id,
      et.name as expertise_name,
      rt.id as resource_type_id,
      rt.name as resource_type_name
    FROM cumulative_engagement ce
    JOIN profiles p ON ce.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles manager ON p.manager = manager.id
    LEFT JOIN general_information manager_gi ON manager.id = manager_gi.profile_id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    WHERE ce.total_engagement < 51
    AND (
      search_query IS NULL 
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR gi.current_designation ILIKE '%' || search_query || '%'
      OR s.name ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
    AND (manager_filter IS NULL OR p.manager = manager_filter)
    ORDER BY 
      COALESCE(gi.first_name, p.first_name) ASC,
      COALESCE(gi.last_name, p.last_name) ASC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  )
  SELECT json_agg(
    json_build_object(
      'id', fp.id,
      'profile_id', fp.id,
      'employee_id', fp.employee_id,
      'first_name', COALESCE(fp.gi_first_name, fp.first_name),
      'last_name', COALESCE(fp.gi_last_name, fp.last_name),
      'current_designation', fp.current_designation,
      'profile_image', fp.profile_image,
      'biography', fp.biography,
      'date_of_joining', fp.date_of_joining,
      'career_start_date', fp.career_start_date,
      'total_engagement_percentage', fp.total_engagement,
      'available_capacity', GREATEST(0, 100 - fp.total_engagement),
      'sbu', CASE WHEN fp.sbu_id IS NOT NULL THEN 
        json_build_object(
          'id', fp.sbu_id, 
          'name', fp.sbu_name, 
          'sbu_head_email', fp.sbu_head_email
        )
        ELSE NULL END,
      'manager', CASE WHEN fp.manager_id IS NOT NULL THEN
        json_build_object(
          'id', fp.manager_id,
          'employee_id', fp.manager_employee_id,
          'first_name', fp.manager_first_name,
          'last_name', fp.manager_last_name
        )
        ELSE NULL END,
      'expertise_type', CASE WHEN fp.expertise_id IS NOT NULL THEN
        json_build_object('id', fp.expertise_id, 'name', fp.expertise_name)
        ELSE NULL END,
      'resource_type', CASE WHEN fp.resource_type_id IS NOT NULL THEN
        json_build_object('id', fp.resource_type_id, 'name', fp.resource_type_name)
        ELSE NULL END,
      'active_assignments', COALESCE(aa.assignments, '[]'::json),
      'created_at', fp.created_at,
      'updated_at', fp.updated_at
    )
  )
  INTO unplanned_array
  FROM filtered_profiles fp
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object(
        'id', rp.id,
        'engagement_percentage', rp.engagement_percentage,
        'billing_percentage', rp.billing_percentage,
        'engagement_start_date', rp.engagement_start_date,
        'release_date', rp.release_date,
        'engagement_complete', rp.engagement_complete,
        'weekly_validation', rp.weekly_validation,
        'project', CASE WHEN pm.id IS NOT NULL THEN
          json_build_object(
            'id', pm.id,
            'project_name', pm.project_name,
            'client_name', pm.client_name,
            'project_manager', pm.project_manager,
            'budget', pm.budget
          )
          ELSE NULL END,
        'bill_type', CASE WHEN bt.id IS NOT NULL THEN
          json_build_object('id', bt.id, 'name', bt.name)
          ELSE NULL END
      )
    ) as assignments
    FROM resource_planning rp
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    WHERE rp.profile_id = fp.id 
      AND (rp.engagement_complete = false OR rp.engagement_complete IS NULL)
  ) aa ON true;

  -- Build final result
  result_data := json_build_object(
    'unplanned_resources', COALESCE(unplanned_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  );

  RETURN result_data;
END;
$$;
