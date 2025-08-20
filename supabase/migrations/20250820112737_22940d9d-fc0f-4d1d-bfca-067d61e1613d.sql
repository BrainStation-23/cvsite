
-- Update RPC function to properly calculate profile completion based on all 8 sections
CREATE OR REPLACE FUNCTION public.get_profile_completion_by_resource_type()
RETURNS TABLE(
  resource_type_id uuid,
  resource_type_name text,
  total_profiles bigint,
  completed_profiles bigint,
  incomplete_profiles bigint,
  completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH profile_completeness AS (
    SELECT 
      p.id as profile_id,
      p.resource_type,
      rt.name as resource_type_name,
      
      -- Check each section for completeness (same logic as get_incomplete_cv_profiles)
      CASE WHEN gi.profile_id IS NULL THEN 'general_information' END as missing_general_info,
      CASE WHEN NOT EXISTS(SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id) 
           THEN 'technical_skills' END as missing_technical_skills,
      CASE WHEN NOT EXISTS(SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id) 
           THEN 'specialized_skills' END as missing_specialized_skills,
      CASE WHEN NOT EXISTS(SELECT 1 FROM education e WHERE e.profile_id = p.id) 
           THEN 'education' END as missing_education,
      CASE WHEN NOT EXISTS(SELECT 1 FROM trainings t WHERE t.profile_id = p.id) 
           THEN 'trainings' END as missing_trainings,
      CASE WHEN NOT EXISTS(SELECT 1 FROM projects pr WHERE pr.profile_id = p.id) 
           THEN 'projects' END as missing_projects,
      CASE WHEN NOT EXISTS(SELECT 1 FROM achievements a WHERE a.profile_id = p.id) 
           THEN 'achievements' END as missing_achievements,
      CASE WHEN NOT EXISTS(SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id) 
           THEN 'experiences' END as missing_experiences
           
    FROM profiles p
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
  ),
  
  profile_completion_scores AS (
    SELECT 
      pc.profile_id,
      pc.resource_type,
      COALESCE(pc.resource_type_name, 'Unspecified') as resource_type_name,
      
      -- Calculate if profile is complete (has all 8 sections)
      CASE WHEN array_length(array_remove(ARRAY[
        pc.missing_general_info,
        pc.missing_technical_skills,
        pc.missing_specialized_skills,
        pc.missing_education,
        pc.missing_trainings,
        pc.missing_projects,
        pc.missing_achievements,
        pc.missing_experiences
      ], NULL), 1) IS NULL OR array_length(array_remove(ARRAY[
        pc.missing_general_info,
        pc.missing_technical_skills,
        pc.missing_specialized_skills,
        pc.missing_education,
        pc.missing_trainings,
        pc.missing_projects,
        pc.missing_achievements,
        pc.missing_experiences
      ], NULL), 1) = 0
      THEN 1 
      ELSE 0 
      END as is_completed
      
    FROM profile_completeness pc
  )
  
  SELECT 
    pcs.resource_type as resource_type_id,
    pcs.resource_type_name,
    COUNT(*)::bigint as total_profiles,
    SUM(pcs.is_completed)::bigint as completed_profiles,
    (COUNT(*) - SUM(pcs.is_completed))::bigint as incomplete_profiles,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((SUM(pcs.is_completed)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0::numeric
    END as completion_rate
  FROM profile_completion_scores pcs
  GROUP BY pcs.resource_type, pcs.resource_type_name
  ORDER BY pcs.resource_type_name NULLS LAST;
END;
$$;
