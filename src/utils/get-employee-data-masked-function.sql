
-- This creates the masked version of employee data for public CV previews
CREATE OR REPLACE FUNCTION public.get_employee_data_masked(profile_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'employee_id', 'EMP-****', -- Masked employee ID
    'first_name', gi.first_name,
    'last_name', gi.last_name,
    'biography', gi.biography,
    'current_designation', gi.current_designation,
    'profile_image', gi.profile_image,
    'technical_skills', (
      SELECT json_agg(
        json_build_object(
          'id', ts.id,
          'name', ts.name,
          'proficiency', ts.proficiency,
          'priority', ts.priority
        )
        ORDER BY ts.priority ASC, ts.name ASC
      )
      FROM technical_skills ts
      WHERE ts.profile_id = profile_uuid
    ),
    'specialized_skills', (
      SELECT json_agg(
        json_build_object(
          'id', ss.id,
          'name', ss.name,
          'proficiency', ss.proficiency
        )
        ORDER BY ss.name ASC
      )
      FROM specialized_skills ss
      WHERE ss.profile_id = profile_uuid
    ),
    'experiences', (
      SELECT json_agg(
        json_build_object(
          'id', ex.id,
          'company_name', ex.company_name,
          'designation', ex.designation,
          'start_date', ex.start_date,
          'end_date', ex.end_date,
          'is_current', ex.is_current,
          'description', ex.description
        )
        ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
      )
      FROM experiences ex
      WHERE ex.profile_id = profile_uuid
    ),
    'education', (
      SELECT json_agg(
        json_build_object(
          'id', ed.id,
          'university', ed.university,
          'degree', ed.degree,
          'department', ed.department,
          'start_date', ed.start_date,
          'end_date', TO_CHAR(ed.end_date, 'YYYY'),
          'is_current', ed.is_current,
          'gpa', ed.gpa
        )
        ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
      )
      FROM education ed
      WHERE ed.profile_id = profile_uuid
    ),
    'trainings', (
      SELECT json_agg(
        json_build_object(
          'id', tr.id,
          'title', tr.title,
          'provider', tr.provider,
          'certification_date', tr.certification_date,
          'description', tr.description
          -- Note: certificate_url excluded for privacy
        )
        ORDER BY tr.certification_date DESC
      )
      FROM trainings tr
      WHERE tr.profile_id = profile_uuid
    ),
    'achievements', (
      SELECT json_agg(
        json_build_object(
          'id', ac.id,
          'title', ac.title,
          'date', ac.date,
          'description', ac.description
        )
        ORDER BY ac.date DESC
      )
      FROM achievements ac
      WHERE ac.profile_id = profile_uuid
    ),
    'projects', (
      SELECT json_agg(
        json_build_object(
          'id', pr.id,
          'name', pr.name,
          'role', pr.role,
          'start_date', TO_CHAR(pr.start_date, 'Mon''YYYY'),
          'end_date', TO_CHAR(pr.end_date, 'Mon''YYYY'),
          'is_current', pr.is_current,
          'description', pr.description,
          'technologies_used', pr.technologies_used,
          'url', pr.url,
          'display_order', pr.display_order,
          'responsibility', pr.responsibility
        )
        ORDER BY pr.is_current DESC NULLS LAST, pr.display_order ASC, pr.start_date DESC
      )
      FROM projects pr
      WHERE pr.profile_id = profile_uuid
    )
  )
  INTO result
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  WHERE p.id = profile_uuid;

  RETURN COALESCE(result, '{}'::json);
END;
$$;
