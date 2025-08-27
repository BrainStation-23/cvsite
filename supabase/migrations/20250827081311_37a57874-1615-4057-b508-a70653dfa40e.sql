
-- Create RPC function to insert PM feedback
CREATE OR REPLACE FUNCTION insert_pip_pm_feedback(
  p_pip_id UUID,
  p_skill_areas TEXT[],
  p_skill_gap_description TEXT,
  p_skill_gap_example TEXT,
  p_behavioral_areas TEXT[],
  p_behavioral_gap_description TEXT,
  p_behavioral_gap_example TEXT,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feedback_id UUID;
BEGIN
  INSERT INTO pip_pm_feedback (
    pip_id,
    skill_areas,
    skill_gap_description,
    skill_gap_example,
    behavioral_areas,
    behavioral_gap_description,
    behavioral_gap_example,
    created_by
  ) VALUES (
    p_pip_id,
    p_skill_areas,
    p_skill_gap_description,
    p_skill_gap_example,
    p_behavioral_areas,
    p_behavioral_gap_description,
    p_behavioral_gap_example,
    p_created_by
  ) RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$;

-- Create RPC function to update PM feedback
CREATE OR REPLACE FUNCTION update_pip_pm_feedback(
  p_feedback_id UUID,
  p_skill_areas TEXT[] DEFAULT NULL,
  p_skill_gap_description TEXT DEFAULT NULL,
  p_skill_gap_example TEXT DEFAULT NULL,
  p_behavioral_areas TEXT[] DEFAULT NULL,
  p_behavioral_gap_description TEXT DEFAULT NULL,
  p_behavioral_gap_example TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pip_pm_feedback 
  SET 
    skill_areas = COALESCE(p_skill_areas, skill_areas),
    skill_gap_description = COALESCE(p_skill_gap_description, skill_gap_description),
    skill_gap_example = COALESCE(p_skill_gap_example, skill_gap_example),
    behavioral_areas = COALESCE(p_behavioral_areas, behavioral_areas),
    behavioral_gap_description = COALESCE(p_behavioral_gap_description, behavioral_gap_description),
    behavioral_gap_example = COALESCE(p_behavioral_gap_example, behavioral_gap_example),
    updated_at = now()
  WHERE id = p_feedback_id;
  
  RETURN p_feedback_id;
END;
$$;
