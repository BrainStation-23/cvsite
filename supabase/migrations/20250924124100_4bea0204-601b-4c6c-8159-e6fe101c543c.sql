-- Fix security warning by setting search_path for get_user_accessible_sbus function
CREATE OR REPLACE FUNCTION public.get_user_accessible_sbus(
  target_user_id uuid DEFAULT NULL::uuid,
  search_query text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_param uuid;
  user_sbu_id uuid;
  user_role_sbu_bound boolean := false;
  user_sbu_context uuid;
  sbu_restrictions uuid[] := '{}';
  accessible_sbu_ids uuid[] := '{}';
  sbus_data json;
  default_sbu_id uuid;
BEGIN
  -- Use provided user_id or current authenticated user
  user_id_param := COALESCE(target_user_id, auth.uid());
  
  IF user_id_param IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get user's profile SBU and role information
  SELECT 
    p.sbu_id,
    COALESCE(cr.is_sbu_bound, false),
    ur.sbu_context
  INTO 
    user_sbu_id,
    user_role_sbu_bound,
    user_sbu_context
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  LEFT JOIN custom_roles cr ON ur.custom_role_id = cr.id
  WHERE p.id = user_id_param;
  
  -- If user has no SBU-bound role, return all SBUs
  IF NOT user_role_sbu_bound THEN
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
      ORDER BY s.name
    )
    INTO sbus_data
    FROM sbus s
    WHERE (
      search_query IS NULL 
      OR s.name ILIKE '%' || search_query || '%'
      OR s.sbu_head_email ILIKE '%' || search_query || '%'
      OR s.sbu_head_name ILIKE '%' || search_query || '%'
    );
    
    -- Default SBU is user's own SBU
    default_sbu_id := user_sbu_id;
  ELSE
    -- For SBU-bound users, get their accessible SBUs
    
    -- Start with user's own SBU (from profile)
    IF user_sbu_id IS NOT NULL THEN
      accessible_sbu_ids := accessible_sbu_ids || user_sbu_id;
    END IF;
    
    -- Add user's SBU context (the SBU they're assigned to via role)
    IF user_sbu_context IS NOT NULL THEN
      accessible_sbu_ids := accessible_sbu_ids || user_sbu_context;
    END IF;
    
    -- Get additional SBU restrictions from role permissions
    SELECT COALESCE(array_agg(DISTINCT unnest), '{}')
    INTO sbu_restrictions
    FROM (
      SELECT unnest(rp.sbu_restrictions)
      FROM user_roles ur
      JOIN role_permissions rp ON ur.custom_role_id = rp.role_id
      WHERE ur.user_id = user_id_param
        AND rp.sbu_restrictions IS NOT NULL
        AND array_length(rp.sbu_restrictions, 1) > 0
    ) AS subq;
    
    -- Add SBU restrictions to accessible SBUs
    accessible_sbu_ids := accessible_sbu_ids || sbu_restrictions;
    
    -- Remove duplicates and NULLs
    SELECT array_agg(DISTINCT sbu_id)
    INTO accessible_sbu_ids
    FROM unnest(accessible_sbu_ids) AS sbu_id
    WHERE sbu_id IS NOT NULL;
    
    -- If no accessible SBUs found, use user's profile SBU as fallback
    IF array_length(accessible_sbu_ids, 1) IS NULL AND user_sbu_id IS NOT NULL THEN
      accessible_sbu_ids := ARRAY[user_sbu_id];
    END IF;
    
    -- Get SBUs data for accessible SBU IDs
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
      ORDER BY s.name
    )
    INTO sbus_data
    FROM sbus s
    WHERE s.id = ANY(accessible_sbu_ids)
      AND (
        search_query IS NULL 
        OR s.name ILIKE '%' || search_query || '%'
        OR s.sbu_head_email ILIKE '%' || search_query || '%'
        OR s.sbu_head_name ILIKE '%' || search_query || '%'
      );
    
    -- Default SBU priority: sbu_context > profile sbu_id > first accessible
    default_sbu_id := COALESCE(
      user_sbu_context,
      user_sbu_id,
      (SELECT id FROM sbus WHERE id = ANY(accessible_sbu_ids) ORDER BY name LIMIT 1)
    );
  END IF;
  
  -- Return the result
  RETURN json_build_object(
    'sbus', COALESCE(sbus_data, '[]'::json),
    'default_sbu_id', default_sbu_id,
    'is_sbu_bound', user_role_sbu_bound
  );
END;
$$;