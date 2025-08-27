
-- Create table for storing PM feedback on PIPs
CREATE TABLE pip_pm_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pip_id UUID NOT NULL REFERENCES performance_improvement_plans(id) ON DELETE CASCADE,
  
  -- Technical/Functional Skill Gaps Section
  skill_areas TEXT[] DEFAULT '{}', -- Array of selected skill areas
  skill_gap_description TEXT,
  skill_gap_example TEXT,
  
  -- Soft Skills & Behavioral Aspects Section  
  behavioral_areas TEXT[] DEFAULT '{}', -- Array of selected behavioral areas
  behavioral_gap_description TEXT,
  behavioral_gap_example TEXT,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE pip_pm_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and managers can view PM feedback"
  ON pip_pm_feedback FOR SELECT
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can create PM feedback"
  ON pip_pm_feedback FOR INSERT
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "Admins and managers can update PM feedback"
  ON pip_pm_feedback FOR UPDATE
  USING (is_admin_or_manager());

CREATE POLICY "Only admins can delete PM feedback"
  ON pip_pm_feedback FOR DELETE
  USING (is_admin());

-- Create RPC function to get PIP details with profile information
CREATE OR REPLACE FUNCTION get_pip_profile_details(pip_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
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
      'status', pip.status::text,
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
      'biography', gi.biography
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
      WHEN manager_p.id IS NOT NULL THEN
        json_build_object(
          'id', manager_p.id,
          'first_name', COALESCE(manager_gi.first_name, manager_p.first_name),
          'last_name', COALESCE(manager_gi.last_name, manager_p.last_name),
          'employee_id', manager_p.employee_id
        )
      ELSE NULL
    END,
    'pm_feedback', CASE 
      WHEN pmf.id IS NOT NULL THEN
        json_build_object(
          'id', pmf.id,
          'skill_areas', pmf.skill_areas,
          'skill_gap_description', pmf.skill_gap_description,
          'skill_gap_example', pmf.skill_gap_example,
          'behavioral_areas', pmf.behavioral_areas,
          'behavioral_gap_description', pmf.behavioral_gap_description,
          'behavioral_gap_example', pmf.behavioral_gap_example,
          'created_at', pmf.created_at,
          'updated_at', pmf.updated_at
        )
      ELSE NULL
    END
  )
  INTO result
  FROM performance_improvement_plans pip
  LEFT JOIN profiles p ON pip.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles manager_p ON p.manager = manager_p.id
  LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
  LEFT JOIN pip_pm_feedback pmf ON pip.id = pmf.pip_id
  WHERE pip.id = pip_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;
