
-- Update get_employee_data function to include limiting parameters
CREATE OR REPLACE FUNCTION public.get_employee_data(
  profile_uuid uuid,
  technical_skills_limit integer DEFAULT 5,
  specialized_skills_limit integer DEFAULT 5,
  experiences_limit integer DEFAULT 5,
  education_limit integer DEFAULT 5,
  trainings_limit integer DEFAULT 5,
  achievements_limit integer DEFAULT 5,
  projects_limit integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'employee_id', p.employee_id,
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
      FROM (
        SELECT ts.* 
        FROM technical_skills ts
        WHERE ts.profile_id = profile_uuid
        ORDER BY ts.priority ASC, ts.name ASC
        LIMIT technical_skills_limit
      ) ts
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
      FROM (
        SELECT ss.* 
        FROM specialized_skills ss
        WHERE ss.profile_id = profile_uuid
        ORDER BY ss.name ASC
        LIMIT specialized_skills_limit
      ) ss
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
      FROM (
        SELECT ex.* 
        FROM experiences ex
        WHERE ex.profile_id = profile_uuid
        ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
        LIMIT experiences_limit
      ) ex
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
      FROM (
        SELECT ed.* 
        FROM education ed
        WHERE ed.profile_id = profile_uuid
        ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
        LIMIT education_limit
      ) ed
    ),
    'trainings', (
      SELECT json_agg(
        json_build_object(
          'id', tr.id,
          'title', tr.title,
          'provider', tr.provider,
          'certification_date', tr.certification_date,
          'description', tr.description,
          'certificate_url', tr.certificate_url
        )
        ORDER BY tr.certification_date DESC
      )
      FROM (
        SELECT tr.* 
        FROM trainings tr
        WHERE tr.profile_id = profile_uuid
        ORDER BY tr.certification_date DESC
        LIMIT trainings_limit
      ) tr
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
      FROM (
        SELECT ac.* 
        FROM achievements ac
        WHERE ac.profile_id = profile_uuid
        ORDER BY ac.date DESC
        LIMIT achievements_limit
      ) ac
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
      FROM (
        SELECT pr.* 
        FROM projects pr
        WHERE pr.profile_id = profile_uuid
        ORDER BY pr.is_current DESC NULLS LAST, pr.display_order ASC, pr.start_date DESC
        LIMIT projects_limit
      ) pr
    )
  )
  INTO result
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  WHERE p.id = profile_uuid;

  RETURN COALESCE(result, '{}'::json);
END;$function$

-- Create get_employee_data_masked function with limiting parameters
CREATE OR REPLACE FUNCTION public.get_employee_data_masked(
  profile_uuid uuid,
  technical_skills_limit integer DEFAULT 5,
  specialized_skills_limit integer DEFAULT 5,
  experiences_limit integer DEFAULT 5,
  education_limit integer DEFAULT 5,
  trainings_limit integer DEFAULT 5,
  achievements_limit integer DEFAULT 5,
  projects_limit integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'employee_id', CASE WHEN p.employee_id IS NOT NULL THEN 'EMP-' || RIGHT(p.employee_id, 3) ELSE NULL END,
    'first_name', LEFT(gi.first_name, 1) || REPEAT('*', GREATEST(0, LENGTH(gi.first_name) - 1)),
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
      FROM (
        SELECT ts.* 
        FROM technical_skills ts
        WHERE ts.profile_id = profile_uuid
        ORDER BY ts.priority ASC, ts.name ASC
        LIMIT technical_skills_limit
      ) ts
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
      FROM (
        SELECT ss.* 
        FROM specialized_skills ss
        WHERE ss.profile_id = profile_uuid
        ORDER BY ss.name ASC
        LIMIT specialized_skills_limit
      ) ss
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
      FROM (
        SELECT ex.* 
        FROM experiences ex
        WHERE ex.profile_id = profile_uuid
        ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
        LIMIT experiences_limit
      ) ex
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
      FROM (
        SELECT ed.* 
        FROM education ed
        WHERE ed.profile_id = profile_uuid
        ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
        LIMIT education_limit
      ) ed
    ),
    'trainings', (
      SELECT json_agg(
        json_build_object(
          'id', tr.id,
          'title', tr.title,
          'provider', tr.provider,
          'certification_date', tr.certification_date,
          'description', tr.description,
          'certificate_url', tr.certificate_url
        )
        ORDER BY tr.certification_date DESC
      )
      FROM (
        SELECT tr.* 
        FROM trainings tr
        WHERE tr.profile_id = profile_uuid
        ORDER BY tr.certification_date DESC
        LIMIT trainings_limit
      ) tr
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
      FROM (
        SELECT ac.* 
        FROM achievements ac
        WHERE ac.profile_id = profile_uuid
        ORDER BY ac.date DESC
        LIMIT achievements_limit
      ) ac
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
      FROM (
        SELECT pr.* 
        FROM projects pr
        WHERE pr.profile_id = profile_uuid
        ORDER BY pr.is_current DESC NULLS LAST, pr.display_order ASC, pr.start_date DESC
        LIMIT projects_limit
      ) pr
    )
  )
  INTO result
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  WHERE p.id = profile_uuid;

  RETURN COALESCE(result, '{}'::json);
END;$function$

-- Add limit configuration columns to cv_templates table
ALTER TABLE cv_templates 
ADD COLUMN technical_skills_limit integer DEFAULT 5,
ADD COLUMN specialized_skills_limit integer DEFAULT 5,
ADD COLUMN experiences_limit integer DEFAULT 5,
ADD COLUMN education_limit integer DEFAULT 5,
ADD COLUMN trainings_limit integer DEFAULT 5,
ADD COLUMN achievements_limit integer DEFAULT 5,
ADD COLUMN projects_limit integer DEFAULT 5;

-- Add check constraints to ensure limits are positive
ALTER TABLE cv_templates 
ADD CONSTRAINT technical_skills_limit_positive CHECK (technical_skills_limit > 0),
ADD CONSTRAINT specialized_skills_limit_positive CHECK (specialized_skills_limit > 0),
ADD CONSTRAINT experiences_limit_positive CHECK (experiences_limit > 0),
ADD CONSTRAINT education_limit_positive CHECK (education_limit > 0),
ADD CONSTRAINT trainings_limit_positive CHECK (trainings_limit > 0),
ADD CONSTRAINT achievements_limit_positive CHECK (achievements_limit > 0),
ADD CONSTRAINT projects_limit_positive CHECK (projects_limit > 0);
