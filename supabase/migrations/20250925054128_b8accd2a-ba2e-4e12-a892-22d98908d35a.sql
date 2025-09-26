-- Update get_user_accessible_sbus to automatically detect user ID and avoid frontend caching issues
CREATE OR REPLACE FUNCTION public.get_user_accessible_sbus(
  target_user_id uuid DEFAULT NULL,
  search_query text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  effective_user_id uuid;
  user_sbu_id uuid;
  user_is_sbu_bound boolean := false;
  user_custom_role_id uuid;
  accessible_sbus json;
BEGIN
  -- Determine the effective user ID
  -- If target_user_id is provided (admin acting on behalf of someone), use it
  -- Otherwise use the authenticated user
  effective_user_id := COALESCE(target_user_id, auth.uid());
  
  IF effective_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;
  
  -- Get user's SBU and role information
  SELECT 
    p.sbu_id,
    ur.custom_role_id
  INTO 
    user_sbu_id,
    user_custom_role_id
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.id = effective_user_id;
  
  -- Determine if user is SBU-bound based on their custom role
  IF user_custom_role_id IS NOT NULL THEN
    SELECT cr.is_sbu_bound
    INTO user_is_sbu_bound
    FROM custom_roles cr
    WHERE cr.id = user_custom_role_id AND cr.is_active = true;
  END IF;
  
  -- If user is SBU-bound, return only their accessible SBUs
  -- If not SBU-bound, return all SBUs
  IF user_is_sbu_bound AND user_sbu_id IS NOT NULL THEN
    -- Return only the user's SBU (SBU-bound users)
    SELECT json_agg(
      json_build_object(
        'id', s.id,
        'name', s.name,
        'sbu_head_email', s.sbu_head_email,
        'sbu_head_name', s.sbu_head_name,
        'is_department', s.is_department,
        'created_at', s.created_at,
        'updated_at', s.updated_at
      )
    )
    INTO accessible_sbus
    FROM sbus s
    WHERE s.id = user_sbu_id
    AND (search_query IS NULL OR s.name ILIKE '%' || search_query || '%');
  ELSE
    -- Return all SBUs (non-SBU-bound users)
    SELECT json_agg(
      json_build_object(
        'id', s.id,
        'name', s.name,
        'sbu_head_email', s.sbu_head_email,
        'sbu_head_name', s.sbu_head_name,
        'is_department', s.is_department,
        'created_at', s.created_at,
        'updated_at', s.updated_at
      )
    )
    INTO accessible_sbus
    FROM sbus s
    WHERE search_query IS NULL OR s.name ILIKE '%' || search_query || '%';
  END IF;
  
  -- Return the result with all necessary information
  RETURN json_build_object(
    'sbus', COALESCE(accessible_sbus, '[]'::json),
    'default_sbu_id', CASE WHEN user_is_sbu_bound THEN user_sbu_id ELSE NULL END,
    'is_sbu_bound', user_is_sbu_bound
  );
END;
$$;