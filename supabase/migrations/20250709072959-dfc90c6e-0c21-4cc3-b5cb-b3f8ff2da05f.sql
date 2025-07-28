
-- Create a dedicated RPC function for fetching unplanned resources
CREATE OR REPLACE FUNCTION public.get_unplanned_resources(
  search_query text DEFAULT NULL::text,
  sbu_filter text DEFAULT NULL::text,
  manager_filter text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  unplanned_data JSON;
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

  -- Get profiles that don't have any resource planning entries
  SELECT json_agg(
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
  )
  INTO unplanned_data
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

  RETURN COALESCE(unplanned_data, '[]'::json);
END;
$function$
