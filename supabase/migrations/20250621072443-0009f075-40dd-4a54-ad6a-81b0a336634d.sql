
-- Create RPC function to search and list all certifications with pagination
CREATE OR REPLACE FUNCTION public.search_certifications(
  search_query text DEFAULT NULL::text,
  provider_filter text DEFAULT NULL::text,
  sbu_filter text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'certification_date'::text,
  sort_order text DEFAULT 'desc'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  certifications_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  certifications_array JSON;
BEGIN
  -- Calculate total certifications count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM trainings t;
  
  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM trainings t
  LEFT JOIN profiles p ON t.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE (
    search_query IS NULL 
    OR t.title ILIKE '%' || search_query || '%'
    OR t.provider ILIKE '%' || search_query || '%'
    OR t.description ILIKE '%' || search_query || '%'
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR s.name ILIKE '%' || search_query || '%'
  )
  AND (provider_filter IS NULL OR t.provider ILIKE '%' || provider_filter || '%')
  AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%');
  
  -- Build certifications query with proper sorting and pagination
  SELECT json_agg(row_to_json(cert))
  INTO certifications_array
  FROM (
    SELECT 
      -- Profile information
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      p.employee_id,
      s.name as sbu_name,
      s.id as sbu_id,
      
      -- Training/Certification information (all columns)
      t.id,
      t.profile_id,
      t.title,
      t.provider,
      t.certification_date,
      t.description,
      t.certificate_url,
      t.is_renewable,
      t.expiry_date,
      t.created_at,
      t.updated_at
    FROM trainings t
    LEFT JOIN profiles p ON t.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE (
      search_query IS NULL 
      OR t.title ILIKE '%' || search_query || '%'
      OR t.provider ILIKE '%' || search_query || '%'
      OR t.description ILIKE '%' || search_query || '%'
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR s.name ILIKE '%' || search_query || '%'
    )
    AND (provider_filter IS NULL OR t.provider ILIKE '%' || provider_filter || '%')
    AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
    ORDER BY
      CASE WHEN sort_by = 'title' AND sort_order = 'asc' THEN t.title END ASC,
      CASE WHEN sort_by = 'title' AND sort_order = 'desc' THEN t.title END DESC,
      CASE WHEN sort_by = 'provider' AND sort_order = 'asc' THEN t.provider END ASC,
      CASE WHEN sort_by = 'provider' AND sort_order = 'desc' THEN t.provider END DESC,
      CASE WHEN sort_by = 'certification_date' AND sort_order = 'asc' THEN t.certification_date END ASC,
      CASE WHEN sort_by = 'certification_date' AND sort_order = 'desc' THEN t.certification_date END DESC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name) END ASC,
      CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name) END DESC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN COALESCE(gi.last_name, p.last_name) END ASC,
      CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN COALESCE(gi.last_name, p.last_name) END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'asc' THEN s.name END ASC,
      CASE WHEN sort_by = 'sbu_name' AND sort_order = 'desc' THEN s.name END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('title', 'provider', 'certification_date', 'first_name', 'last_name', 'employee_id', 'sbu_name')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN t.certification_date END DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) cert;
  
  -- Build final result JSON
  SELECT json_build_object(
    'certifications', COALESCE(certifications_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO certifications_data;
  
  RETURN certifications_data;
END;
$function$
