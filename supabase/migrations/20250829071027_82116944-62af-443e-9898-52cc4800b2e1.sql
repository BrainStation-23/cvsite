
-- Update the list_users RPC function to include new filter parameters
CREATE OR REPLACE FUNCTION public.list_users(
  search_query text DEFAULT NULL,
  filter_role text DEFAULT NULL,
  filter_sbu_id uuid DEFAULT NULL,
  filter_manager_id uuid DEFAULT NULL,
  filter_resource_type_id uuid DEFAULT NULL,
  filter_expertise_id uuid DEFAULT NULL,
  filter_min_total_years integer DEFAULT NULL,
  filter_max_total_years integer DEFAULT NULL,
  filter_min_company_years integer DEFAULT NULL,
  filter_max_company_years integer DEFAULT NULL,
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
  users_data json;
  total_count integer;
  filtered_count integer;
  users_array json;
BEGIN
  -- Calculate total users count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id;
  
  -- Count filtered results with all filters
  SELECT COUNT(*)
  INTO filtered_count
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  LEFT JOIN resource_types rt ON p.resource_type = rt.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  WHERE (
    search_query IS NULL 
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.email ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
  )
  AND (filter_role IS NULL OR ur.role = filter_role)
  AND (filter_sbu_id IS NULL OR p.sbu_id = filter_sbu_id)
  AND (filter_manager_id IS NULL OR p.manager = filter_manager_id)
  AND (filter_resource_type_id IS NULL OR p.resource_type = filter_resource_type_id)
  AND (filter_expertise_id IS NULL OR p.expertise = filter_expertise_id)
  AND (
    filter_min_total_years IS NULL 
    OR p.career_start_date IS NULL 
    OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) >= filter_min_total_years
  )
  AND (
    filter_max_total_years IS NULL 
    OR p.career_start_date IS NULL 
    OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) <= filter_max_total_years
  )
  AND (
    filter_min_company_years IS NULL 
    OR p.date_of_joining IS NULL 
    OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) >= filter_min_company_years
  )
  AND (
    filter_max_company_years IS NULL 
    OR p.date_of_joining IS NULL 
    OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) <= filter_max_company_years
  );
  
  -- Build users query with comprehensive data, sorting and pagination
  SELECT json_agg(
    json_build_object(
      'id', au.id,
      'email', COALESCE(p.email, au.email),
      'first_name', p.first_name,
      'last_name', p.last_name,
      'role', ur.role,
      'employee_id', p.employee_id,
      'sbu_id', p.sbu_id,
      'sbu_name', s.name,
      'created_at', au.created_at,
      'last_sign_in_at', au.last_sign_in_at,
      'date_of_joining', p.date_of_joining,
      'career_start_date', p.career_start_date,
      'manager_id', p.manager,
      'manager_name', CASE 
        WHEN mp.id IS NOT NULL THEN 
          CONCAT(COALESCE(mgi.first_name, mp.first_name), ' ', COALESCE(mgi.last_name, mp.last_name))
        ELSE NULL 
      END,
      'expertise_id', p.expertise,
      'expertise_name', et.name,
      'resource_type_id', p.resource_type,
      'resource_type_name', rt.name
    )
    ORDER BY
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN au.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN au.created_at END DESC,
      CASE WHEN sort_by = 'email' AND sort_order = 'asc' THEN COALESCE(p.email, au.email) END ASC,
      CASE WHEN sort_by = 'email' AND sort_order = 'desc' THEN COALESCE(p.email, au.email) END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('created_at', 'email', 'first_name', 'last_name')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN au.created_at END DESC
  )
  INTO users_array
  FROM (
    SELECT au.*, 
           ROW_NUMBER() OVER (
             ORDER BY
               CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN au.created_at END ASC,
               CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN au.created_at END DESC,
               CASE WHEN sort_by = 'email' AND sort_order = 'asc' THEN COALESCE(p.email, au.email) END ASC,
               CASE WHEN sort_by = 'email' AND sort_order = 'desc' THEN COALESCE(p.email, au.email) END DESC,
               CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN p.first_name END ASC,
               CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN p.first_name END DESC,
               CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN p.last_name END ASC,
               CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN p.last_name END DESC,
               CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('created_at', 'email', 'first_name', 'last_name')) 
                 AND (sort_order IS NULL OR sort_order = 'desc') THEN au.created_at END DESC
           ) as row_num
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
    LEFT JOIN user_roles ur ON au.id = ur.user_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mp ON p.manager = mp.id
    LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE (
      search_query IS NULL 
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.email ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
    )
    AND (filter_role IS NULL OR ur.role = filter_role)
    AND (filter_sbu_id IS NULL OR p.sbu_id = filter_sbu_id)
    AND (filter_manager_id IS NULL OR p.manager = filter_manager_id)
    AND (filter_resource_type_id IS NULL OR p.resource_type = filter_resource_type_id)
    AND (filter_expertise_id IS NULL OR p.expertise = filter_expertise_id)
    AND (
      filter_min_total_years IS NULL 
      OR p.career_start_date IS NULL 
      OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) >= filter_min_total_years
    )
    AND (
      filter_max_total_years IS NULL 
      OR p.career_start_date IS NULL 
      OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) <= filter_max_total_years
    )
    AND (
      filter_min_company_years IS NULL 
      OR p.date_of_joining IS NULL 
      OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) >= filter_min_company_years
    )
    AND (
      filter_max_company_years IS NULL 
      OR p.date_of_joining IS NULL 
      OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_joining)) <= filter_max_company_years
    )
  ) au
  LEFT JOIN profiles p ON au.id = p.id
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  LEFT JOIN resource_types rt ON p.resource_type = rt.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  WHERE au.row_num > (page_number - 1) * items_per_page
    AND au.row_num <= page_number * items_per_page;
  
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
