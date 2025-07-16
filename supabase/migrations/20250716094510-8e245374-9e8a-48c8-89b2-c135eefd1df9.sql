
-- Update the list_users function to include IDs for manager, expertise, and resource type
CREATE OR REPLACE FUNCTION public.list_users(
  search_query text DEFAULT NULL,
  filter_role text DEFAULT NULL,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  users_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  users_array JSON;
BEGIN
  -- Calculate total users count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id;
  
  -- Count filtered results
  SELECT COUNT(DISTINCT au.id)
  INTO filtered_count
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN profiles p ON au.id = p.id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles manager_profile ON p.manager = manager_profile.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN resource_types rt ON p.resource_type = rt.id
  WHERE (
    search_query IS NULL
    OR au.email ILIKE '%' || search_query || '%'
    OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
    OR COALESCE(s.name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(et.name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(rt.name, '') ILIKE '%' || search_query || '%'
  )
  AND (filter_role IS NULL OR ur.role = filter_role);
  
  -- Build users query with proper sorting, filtering, and pagination
  SELECT json_agg(row_to_json(user_data))
  INTO users_array
  FROM (
    SELECT 
      au.id,
      au.email,
      au.created_at,
      au.last_sign_in_at,
      COALESCE(p.first_name, '') as first_name,
      COALESCE(p.last_name, '') as last_name,
      COALESCE(ur.role, 'employee') as role,
      p.employee_id,
      p.sbu_id,
      s.name as sbu_name,
      p.date_of_joining,
      p.career_start_date,
      -- Manager information with both ID and name
      p.manager as manager_id,
      CASE 
        WHEN manager_profile.id IS NOT NULL THEN 
          COALESCE(manager_profile.first_name, '') || ' ' || COALESCE(manager_profile.last_name, '')
        ELSE NULL
      END as manager_name,
      -- Expertise information with both ID and name
      p.expertise as expertise_id,
      et.name as expertise_name,
      -- Resource Type information with both ID and name
      p.resource_type as resource_type_id,
      rt.name as resource_type_name
    FROM auth.users au
    LEFT JOIN user_roles ur ON au.id = ur.user_id
    LEFT JOIN profiles p ON au.id = p.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles manager_profile ON p.manager = manager_profile.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    WHERE (
      search_query IS NULL
      OR au.email ILIKE '%' || search_query || '%'
      OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
      OR COALESCE(s.name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(et.name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(rt.name, '') ILIKE '%' || search_query || '%'
    )
    AND (filter_role IS NULL OR ur.role = filter_role)
    ORDER BY
      CASE WHEN sort_by = 'email' AND sort_order = 'asc' THEN au.email END ASC,
      CASE WHEN sort_by = 'email' AND sort_order = 'desc' THEN au.email END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN COALESCE(p.first_name, '') END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN COALESCE(p.first_name, '') END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN COALESCE(p.last_name, '') END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN COALESCE(p.last_name, '') END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN au.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN au.created_at END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'asc' THEN s.name END ASC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'desc' THEN s.name END DESC,
      au.created_at DESC -- Default fallback
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) AS user_data;
  
  -- Build final result JSON
  SELECT json_build_object(
    'users', COALESCE(users_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO users_data;
  
  RETURN users_data;
END;
$$;
