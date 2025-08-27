
-- Update the get_pip_profile_details function to include resource planning data
CREATE OR REPLACE FUNCTION public.get_pip_profile_details(input_pip_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result_json json;
BEGIN
  SELECT json_build_object(
    'pip', json_build_object(
      'id', pip.id,
      'profile_id', pip.profile_id,
      'overall_feedback', pip.overall_feedback,
      'start_date', pip.start_date,
      'mid_date', pip.mid_date,
      'end_date', pip.end_date,
      'final_review', pip.final_review,
      'status', pip.status,
      'created_at', pip.created_at,
      'updated_at', pip.updated_at
    ),
    'profile', json_build_object(
      'id', p.id,
      'first_name', COALESCE(gi.first_name, p.first_name),
      'last_name', COALESCE(gi.last_name, p.last_name),
      'employee_id', p.employee_id,
      'email', p.email,
      'profile_image', gi.profile_image,
      'current_designation', gi.current_designation,
      'biography', gi.biography,
      'resource_planning', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', rp_inner.id,
            'project_name', pm_inner.project_name,
            'client_name', pm_inner.client_name,
            'project_manager', CONCAT(COALESCE(pmgi_inner.first_name, pmp_inner.first_name), ' ', COALESCE(pmgi_inner.last_name, pmp_inner.last_name)),
            'engagement_percentage', rp_inner.engagement_percentage,
            'billing_percentage', rp_inner.billing_percentage,
            'bill_type_name', bt_inner.name,
            'engagement_start_date', rp_inner.engagement_start_date,
            'release_date', rp_inner.release_date,
            'is_current', NOT rp_inner.engagement_complete
          )
        )
        FROM resource_planning rp_inner
        LEFT JOIN projects_management pm_inner ON rp_inner.project_id = pm_inner.id
        LEFT JOIN profiles pmp_inner ON pm_inner.project_manager = pmp_inner.id
        LEFT JOIN general_information pmgi_inner ON pmp_inner.id = pmgi_inner.profile_id
        LEFT JOIN bill_types bt_inner ON rp_inner.bill_type_id = bt_inner.id
        WHERE rp_inner.profile_id = p.id
        AND rp_inner.engagement_start_date >= CURRENT_DATE - INTERVAL '3 months'
        ), '[]'::jsonb
      )
    ),
    'sbu', CASE 
      WHEN s.id IS NOT NULL THEN
        json_build_object(
          'id', s.id,
          'name', s.name
        )
      ELSE NULL
    END,
    'expertise', CASE 
      WHEN et.id IS NOT NULL THEN
        json_build_object(
          'id', et.id,
          'name', et.name
        )
      ELSE NULL
    END,
    'manager', CASE 
      WHEN mp.id IS NOT NULL THEN
        json_build_object(
          'id', mp.id,
          'first_name', COALESCE(mgi.first_name, mp.first_name),
          'last_name', COALESCE(mgi.last_name, mp.last_name),
          'employee_id', mp.employee_id
        )
      ELSE NULL
    END,
    'pm_feedback', CASE 
      WHEN pmf.id IS NOT NULL THEN
        json_build_object(
          'id', pmf.id,
          'pip_id', pmf.pip_id,
          'skill_areas', pmf.skill_areas,
          'skill_gap_description', pmf.skill_gap_description,
          'skill_gap_example', pmf.skill_gap_example,
          'behavioral_areas', pmf.behavioral_areas,
          'behavioral_gap_description', pmf.behavioral_gap_description,
          'behavioral_gap_example', pmf.behavioral_gap_example,
          'created_by', pmf.created_by,
          'created_at', pmf.created_at,
          'updated_at', pmf.updated_at
        )
      ELSE NULL
    END
  )
  INTO result_json
  FROM performance_improvement_plans pip
  LEFT JOIN profiles p ON pip.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  LEFT JOIN pip_pm_feedback pmf ON pip.id = pmf.pip_id
  WHERE pip.id = input_pip_id;
  
  RETURN result_json;
END;
$function$
