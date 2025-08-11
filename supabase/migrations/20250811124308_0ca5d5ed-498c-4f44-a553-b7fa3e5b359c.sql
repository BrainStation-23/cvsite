
-- Create a comprehensive view for employee profiles that can be used with Algolia
CREATE OR REPLACE VIEW public.employee_profiles_search_view AS
SELECT 
  -- Core profile information
  p.id as profile_id,
  p.employee_id,
  p.email,
  p.created_at,
  p.updated_at,
  p.date_of_joining,
  p.career_start_date,
  
  -- General information (prioritize from general_information table)
  COALESCE(gi.first_name, p.first_name) as first_name,
  COALESCE(gi.last_name, p.last_name) as last_name,
  gi.biography,
  gi.profile_image,
  gi.current_designation,
  
  -- SBU information
  s.id as sbu_id,
  s.name as sbu_name,
  s.sbu_head_email,
  
  -- Expertise information
  et.id as expertise_id,
  et.name as expertise_name,
  
  -- Resource type information
  rt.id as resource_type_id,
  rt.name as resource_type_name,
  
  -- Manager information
  mgr_p.id as manager_id,
  COALESCE(mgr_gi.first_name, mgr_p.first_name) as manager_first_name,
  COALESCE(mgr_gi.last_name, mgr_p.last_name) as manager_last_name,
  mgr_p.employee_id as manager_employee_id,
  
  -- Experience calculations
  COALESCE(
    EXTRACT(EPOCH FROM (CURRENT_DATE - p.career_start_date)) / 31536000.0, 
    0
  )::integer as total_experience_years,
  
  COALESCE(
    EXTRACT(EPOCH FROM (CURRENT_DATE - p.date_of_joining)) / 31536000.0,
    0
  )::integer as company_experience_years,
  
  -- Resource planning information (latest)
  rp.id as resource_planning_id,
  rp.engagement_percentage,
  rp.billing_percentage,
  rp.engagement_start_date,
  rp.release_date,
  rp.engagement_complete,
  rp.weekly_validation,
  
  -- Calculate availability status
  CASE 
    WHEN rp.engagement_complete = true OR rp.engagement_percentage IS NULL OR rp.engagement_percentage < 80 
    THEN 'available'
    WHEN rp.engagement_complete = false AND rp.engagement_percentage >= 80 
    THEN 'engaged'
    ELSE 'unknown'
  END as availability_status,
  
  -- Calculate days until available
  CASE 
    WHEN rp.release_date IS NOT NULL AND rp.release_date > CURRENT_DATE 
    THEN (rp.release_date - CURRENT_DATE)::integer
    ELSE 0
  END as days_until_available,
  
  -- Current project information
  pm.id as current_project_id,
  pm.project_name as current_project_name,
  pm.client_name as current_project_client,
  pm.project_manager as current_project_manager_id,
  
  -- Bill type information
  bt.id as bill_type_id,
  bt.name as bill_type_name,
  
  -- Technical skills (aggregated as JSON for search)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', ts.id,
        'name', ts.name,
        'proficiency', ts.proficiency,
        'priority', ts.priority
      ) ORDER BY ts.priority ASC, ts.name ASC
    )
    FROM technical_skills ts 
    WHERE ts.profile_id = p.id),
    '[]'::json
  ) as technical_skills,
  
  -- Technical skills as searchable text
  COALESCE(
    (SELECT string_agg(ts.name, ', ' ORDER BY ts.priority ASC, ts.name ASC)
    FROM technical_skills ts 
    WHERE ts.profile_id = p.id),
    ''
  ) as technical_skills_text,
  
  -- Specialized skills (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', ss.id,
        'name', ss.name,
        'proficiency', ss.proficiency
      ) ORDER BY ss.name ASC
    )
    FROM specialized_skills ss 
    WHERE ss.profile_id = p.id),
    '[]'::json
  ) as specialized_skills,
  
  -- Specialized skills as searchable text
  COALESCE(
    (SELECT string_agg(ss.name, ', ' ORDER BY ss.name ASC)
    FROM specialized_skills ss 
    WHERE ss.profile_id = p.id),
    ''
  ) as specialized_skills_text,
  
  -- Experiences (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', ex.id,
        'company_name', ex.company_name,
        'designation', ex.designation,
        'start_date', ex.start_date,
        'end_date', ex.end_date,
        'is_current', ex.is_current,
        'description', ex.description
      ) ORDER BY ex.is_current DESC NULLS LAST, ex.start_date DESC
    )
    FROM experiences ex 
    WHERE ex.profile_id = p.id),
    '[]'::json
  ) as experiences,
  
  -- Experience companies as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT ex.company_name, ', ')
    FROM experiences ex 
    WHERE ex.profile_id = p.id AND ex.company_name IS NOT NULL),
    ''
  ) as experience_companies_text,
  
  -- Experience designations as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT ex.designation, ', ')
    FROM experiences ex 
    WHERE ex.profile_id = p.id AND ex.designation IS NOT NULL),
    ''
  ) as experience_designations_text,
  
  -- Education (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', ed.id,
        'university', ed.university,
        'degree', ed.degree,
        'department', ed.department,
        'start_date', ed.start_date,
        'end_date', ed.end_date,
        'is_current', ed.is_current,
        'gpa', ed.gpa
      ) ORDER BY ed.is_current DESC NULLS LAST, ed.start_date DESC
    )
    FROM education ed 
    WHERE ed.profile_id = p.id),
    '[]'::json
  ) as education,
  
  -- Education institutions as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT ed.university, ', ')
    FROM education ed 
    WHERE ed.profile_id = p.id AND ed.university IS NOT NULL),
    ''
  ) as education_institutions_text,
  
  -- Education degrees as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT ed.degree, ', ')
    FROM education ed 
    WHERE ed.profile_id = p.id AND ed.degree IS NOT NULL),
    ''
  ) as education_degrees_text,
  
  -- Trainings/Certifications (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', tr.id,
        'title', tr.title,
        'provider', tr.provider,
        'certification_date', tr.certification_date,
        'is_renewable', tr.is_renewable,
        'expiry_date', tr.expiry_date,
        'certificate_url', tr.certificate_url
      ) ORDER BY tr.certification_date DESC
    )
    FROM trainings tr 
    WHERE tr.profile_id = p.id),
    '[]'::json
  ) as trainings,
  
  -- Training titles as searchable text
  COALESCE(
    (SELECT string_agg(tr.title, ', ' ORDER BY tr.certification_date DESC)
    FROM trainings tr 
    WHERE tr.profile_id = p.id AND tr.title IS NOT NULL),
    ''
  ) as training_titles_text,
  
  -- Training providers as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT tr.provider, ', ')
    FROM trainings tr 
    WHERE tr.profile_id = p.id AND tr.provider IS NOT NULL),
    ''
  ) as training_providers_text,
  
  -- Achievements (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', ac.id,
        'title', ac.title,
        'date', ac.date,
        'description', ac.description
      ) ORDER BY ac.date DESC
    )
    FROM achievements ac 
    WHERE ac.profile_id = p.id),
    '[]'::json
  ) as achievements,
  
  -- Achievement titles as searchable text
  COALESCE(
    (SELECT string_agg(ac.title, ', ' ORDER BY ac.date DESC)
    FROM achievements ac 
    WHERE ac.profile_id = p.id AND ac.title IS NOT NULL),
    ''
  ) as achievement_titles_text,
  
  -- Projects (aggregated as JSON)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', pr.id,
        'name', pr.name,
        'role', pr.role,
        'start_date', pr.start_date,
        'end_date', pr.end_date,
        'is_current', pr.is_current,
        'description', pr.description,
        'responsibility', pr.responsibility,
        'technologies_used', pr.technologies_used,
        'url', pr.url,
        'display_order', pr.display_order
      ) ORDER BY pr.is_current DESC NULLS LAST, pr.display_order ASC, pr.start_date DESC
    )
    FROM projects pr 
    WHERE pr.profile_id = p.id),
    '[]'::json
  ) as projects,
  
  -- Project names as searchable text
  COALESCE(
    (SELECT string_agg(pr.name, ', ' ORDER BY pr.is_current DESC NULLS LAST, pr.start_date DESC)
    FROM projects pr 
    WHERE pr.profile_id = p.id AND pr.name IS NOT NULL),
    ''
  ) as project_names_text,
  
  -- Project technologies as searchable text
  COALESCE(
    (SELECT string_agg(DISTINCT tech, ', ')
    FROM projects pr, unnest(pr.technologies_used) as tech
    WHERE pr.profile_id = p.id AND pr.technologies_used IS NOT NULL),
    ''
  ) as project_technologies_text,
  
  -- Combined search text for full-text search
  CONCAT_WS(' ',
    COALESCE(gi.first_name, p.first_name, ''),
    COALESCE(gi.last_name, p.last_name, ''),
    p.employee_id,
    p.email,
    gi.biography,
    gi.current_designation,
    s.name,
    et.name,
    rt.name,
    -- Include searchable text fields
    (SELECT string_agg(ts.name, ' ') FROM technical_skills ts WHERE ts.profile_id = p.id),
    (SELECT string_agg(ss.name, ' ') FROM specialized_skills ss WHERE ss.profile_id = p.id),
    (SELECT string_agg(ex.company_name, ' ') FROM experiences ex WHERE ex.profile_id = p.id),
    (SELECT string_agg(ex.designation, ' ') FROM experiences ex WHERE ex.profile_id = p.id),
    (SELECT string_agg(ed.university, ' ') FROM education ed WHERE ed.profile_id = p.id),
    (SELECT string_agg(ed.degree, ' ') FROM education ed WHERE ed.profile_id = p.id),
    (SELECT string_agg(tr.title, ' ') FROM trainings tr WHERE tr.profile_id = p.id),
    (SELECT string_agg(tr.provider, ' ') FROM trainings tr WHERE tr.profile_id = p.id),
    (SELECT string_agg(ac.title, ' ') FROM achievements ac WHERE ac.profile_id = p.id),
    (SELECT string_agg(pr.name, ' ') FROM projects pr WHERE pr.profile_id = p.id)
  ) as search_text

FROM profiles p
LEFT JOIN general_information gi ON p.id = gi.profile_id
LEFT JOIN sbus s ON p.sbu_id = s.id
LEFT JOIN expertise_types et ON p.expertise = et.id
LEFT JOIN resource_types rt ON p.resource_type = rt.id
LEFT JOIN profiles mgr_p ON p.manager = mgr_p.id
LEFT JOIN general_information mgr_gi ON mgr_p.id = mgr_gi.profile_id
LEFT JOIN resource_planning rp ON p.id = rp.profile_id
LEFT JOIN projects_management pm ON rp.project_id = pm.id
LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id;

-- Add RLS policy for the view to match the profiles table security
ALTER VIEW public.employee_profiles_search_view SET (security_invoker = true);

-- Create a comment to document the view's purpose
COMMENT ON VIEW public.employee_profiles_search_view IS 'Comprehensive view for employee profiles designed for Algolia search integration. Includes all profile data, skills, experiences, education, trainings, achievements, projects, and resource planning information in a flattened structure suitable for search indexing.';
