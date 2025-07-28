
-- Update the RPC function to support pagination for unplanned resources
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  unplanned_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  sbu_uuid UUID;
  manager_uuid UUID;
BEGIN
  -- Convert string filters to UUIDs if they are valid UUIDs, otherwise keep as NULL
  BEGIN
    sbu_uuid := CASE WHEN sbu_filter IS NOT NULL AND sbu_filter != '' THEN sbu_filter::UUID ELSE NULL END;
  EXCEPTION
    WHEN invalid_text_representation THEN
      sbu_uuid := NULL;
  END;
  
  BEGIN
    manager_uuid := CASE WHEN manager_filter IS NOT NULL AND manager_filter != '' THEN manager_filter::UUID ELSE NULL END;
  EXCEPTION
    WHEN invalid_text_representation THEN
      manager_uuid := NULL;
  END;

  -- Calculate total unplanned resources count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
  );

  -- Count filtered results
  SELECT COUNT(DISTINCT p.id)
  INTO filtered_count
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  WHERE NOT EXISTS (
    SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
  )
  AND (
    search_query IS NULL
    OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
    OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
  )
  AND (sbu_uuid IS NULL OR p.sbu_id = sbu_uuid)
  AND (manager_uuid IS NULL OR p.manager = manager_uuid);

  -- Get paginated profiles that don't have any resource planning entries
  SELECT json_build_object(
    'unplanned_resources', json_agg(
      json_build_object(
        'id', p.id,
        'employee_id', COALESCE(p.employee_id, ''),
        'first_name', COALESCE(gi.first_name, p.first_name, ''),
        'last_name', COALESCE(gi.last_name, p.last_name, ''),
        'current_designation', COALESCE(gi.current_designation, ''),
        'sbu_name', COALESCE(s.name, ''),
        'manager_name', CASE 
          WHEN mp.id IS NOT NULL THEN 
            TRIM(COALESCE(mgi.first_name, mp.first_name, '') || ' ' || COALESCE(mgi.last_name, mp.last_name, ''))
          ELSE 'N/A'
        END
      )
    ),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CASE WHEN filtered_count > 0 THEN CEIL(filtered_count::numeric / items_per_page) ELSE 0 END
    )
  )
  INTO unplanned_data
  FROM (
    SELECT p.id
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN profiles mp ON p.manager = mp.id
    LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
    WHERE NOT EXISTS (
      SELECT 1 FROM resource_planning rp WHERE rp.profile_id = p.id
    )
    AND (
      search_query IS NULL
      OR COALESCE(p.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.last_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.employee_id, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.first_name, '') ILIKE '%' || search_query || '%'
      OR COALESCE(gi.last_name, '') ILIKE '%' || search_query || '%'
    )
    AND (sbu_uuid IS NULL OR p.sbu_id = sbu_uuid)
    AND (manager_uuid IS NULL OR p.manager = manager_uuid)
    ORDER BY COALESCE(gi.first_name, p.first_name, ''), COALESCE(gi.last_name, p.last_name, '')
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) filtered_profiles
  JOIN profiles p ON p.id = filtered_profiles.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id;

  RETURN COALESCE(unplanned_data, json_build_object('unplanned_resources', '[]'::json, 'pagination', json_build_object('total_count', 0, 'filtered_count', 0, 'page', 1, 'per_page', items_per_page, 'page_count', 0)));
END;
$function$
