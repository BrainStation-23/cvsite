
-- Create RPC function to fetch comprehensive profile details for PIP form
CREATE OR REPLACE FUNCTION get_pip_profile_details(target_profile_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  resource_planning_data json[];
  total_utilization_percent numeric := 0;
BEGIN
  -- Get main profile data with all related information
  SELECT json_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'employee_id', p.employee_id,
    'profile_image', gi.profile_image,
    'sbu_name', s.name,
    'expertise_name', et.name,
    'manager_id', p.manager,
    'manager_name', CASE 
      WHEN manager_p.id IS NOT NULL THEN
        CONCAT(
          COALESCE(manager_gi.first_name, manager_p.first_name), ' ',
          COALESCE(manager_gi.last_name, manager_p.last_name)
        )
      ELSE NULL
    END,
    'current_designation', gi.current_designation
  )
  INTO profile_data
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles manager_p ON p.manager = manager_p.id
  LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
  WHERE p.id = target_profile_id;

  -- Get resource planning data from last 3 months
  SELECT array_agg(
    json_build_object(
      'id', rp.id,
      'project_name', pm.project_name,
      'client_name', pm.client_name,
      'project_manager', pm.project_manager,
      'engagement_percentage', rp.engagement_percentage,
      'billing_percentage', rp.billing_percentage,
      'bill_type_name', bt.name,
      'engagement_start_date', rp.engagement_start_date,
      'release_date', rp.release_date,
      'is_current', NOT rp.engagement_complete
    )
    ORDER BY rp.engagement_start_date DESC
  )
  INTO resource_planning_data
  FROM resource_planning rp
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  WHERE rp.profile_id = target_profile_id
    AND rp.engagement_start_date >= (CURRENT_DATE - INTERVAL '3 months')
    AND rp.engagement_start_date IS NOT NULL;

  -- Calculate total current utilization
  SELECT COALESCE(SUM(rp.engagement_percentage), 0)
  INTO total_utilization_percent
  FROM resource_planning rp
  WHERE rp.profile_id = target_profile_id
    AND rp.engagement_complete = false
    AND rp.engagement_percentage IS NOT NULL;

  -- Return comprehensive profile data
  RETURN json_build_object(
    'id', (profile_data->>'id')::uuid,
    'first_name', profile_data->>'first_name',
    'last_name', profile_data->>'last_name',
    'employee_id', profile_data->>'employee_id',
    'profile_image', profile_data->>'profile_image',
    'sbu_name', profile_data->>'sbu_name',
    'expertise_name', profile_data->>'expertise_name',
    'manager_id', CASE 
      WHEN profile_data->>'manager_id' IS NOT NULL 
      THEN (profile_data->>'manager_id')::uuid 
      ELSE NULL 
    END,
    'manager_name', profile_data->>'manager_name',
    'current_designation', profile_data->>'current_designation',
    'resource_planning', COALESCE(resource_planning_data, ARRAY[]::json[]),
    'total_utilization', LEAST(total_utilization_percent, 100)
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in get_pip_profile_details for profile %: %', target_profile_id, SQLERRM;
    RETURN json_build_object(
      'error', 'Failed to fetch profile details',
      'details', SQLERRM
    );
END;
$$;
