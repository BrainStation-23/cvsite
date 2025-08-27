
-- Create a new RPC function for getting profile details during PIP initiation
CREATE OR REPLACE FUNCTION public.get_profile_details_for_pip(profile_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  employee_id text,
  profile_image text,
  sbu_name text,
  expertise_name text,
  manager_name text,
  manager_id uuid,
  current_designation text,
  resource_planning jsonb,
  total_utilization numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(gi.first_name, p.first_name) as first_name,
    COALESCE(gi.last_name, p.last_name) as last_name,
    p.employee_id,
    gi.profile_image,
    s.name as sbu_name,
    et.name as expertise_name,
    CASE 
      WHEN mp.id IS NOT NULL THEN 
        CONCAT(COALESCE(mgi.first_name, mp.first_name), ' ', COALESCE(mgi.last_name, mp.last_name))
      ELSE NULL 
    END as manager_name,
    p.manager as manager_id,
    gi.current_designation,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', rp.id,
          'project_name', pm.project_name,
          'client_name', pm.client_name,
          'project_manager', CONCAT(COALESCE(pmgi.first_name, pmp.first_name), ' ', COALESCE(pmgi.last_name, pmp.last_name)),
          'engagement_percentage', rp.engagement_percentage,
          'billing_percentage', rp.billing_percentage,
          'bill_type_name', bt.name,
          'engagement_start_date', rp.engagement_start_date,
          'release_date', rp.release_date,
          'is_current', NOT rp.engagement_complete
        )
      )
      FROM resource_planning rp
      LEFT JOIN projects_management pm ON rp.project_id = pm.id
      LEFT JOIN profiles pmp ON pm.project_manager = pmp.id
      LEFT JOIN general_information pmgi ON pmp.id = pmgi.profile_id
      LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
      WHERE rp.profile_id = p.id
      ), '[]'::jsonb
    ) as resource_planning,
    COALESCE(
      (SELECT SUM(rp.engagement_percentage)
       FROM resource_planning rp 
       WHERE rp.profile_id = p.id 
       AND NOT rp.engagement_complete), 
      0
    )::numeric as total_utilization
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  WHERE p.id = profile_id;
END;
$$;
