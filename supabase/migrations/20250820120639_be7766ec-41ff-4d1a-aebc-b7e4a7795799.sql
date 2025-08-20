
-- Create new RPC function for percentage-based profile completion statistics
CREATE OR REPLACE FUNCTION public.get_profile_completion_statistics()
RETURNS TABLE(
  total_profiles bigint,
  avg_completion_rate numeric,
  profiles_above_50_percent bigint,
  profiles_above_75_percent bigint,
  resource_type_breakdown jsonb
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
      
      -- Check each section for completeness
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
  
  profile_completion_percentages AS (
    SELECT 
      pc.profile_id,
      pc.resource_type,
      COALESCE(pc.resource_type_name, 'Unspecified') as resource_type_name,
      
      -- Calculate completion percentage (completed sections out of 8)
      CASE 
        WHEN array_length(array_remove(ARRAY[
          pc.missing_general_info,
          pc.missing_technical_skills,
          pc.missing_specialized_skills,
          pc.missing_education,
          pc.missing_trainings,
          pc.missing_projects,
          pc.missing_achievements,
          pc.missing_experiences
        ], NULL), 1) IS NULL THEN 100.0
        ELSE (8 - array_length(array_remove(ARRAY[
          pc.missing_general_info,
          pc.missing_technical_skills,
          pc.missing_specialized_skills,
          pc.missing_education,
          pc.missing_trainings,
          pc.missing_projects,
          pc.missing_achievements,
          pc.missing_experiences
        ], NULL), 1)) * 12.5  -- 100/8 = 12.5
      END as completion_percentage
      
    FROM profile_completeness pc
  ),
  
  resource_type_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'resource_type_id', pcp.resource_type,
          'resource_type_name', pcp.resource_type_name,
          'total_profiles', COUNT(*),
          'avg_completion_rate', ROUND(AVG(pcp.completion_percentage), 2)
        )
      ) as breakdown
    FROM profile_completion_percentages pcp
    GROUP BY pcp.resource_type, pcp.resource_type_name
  )
  
  SELECT 
    COUNT(*)::bigint as total_profiles,
    ROUND(AVG(pcp.completion_percentage), 2) as avg_completion_rate,
    COUNT(CASE WHEN pcp.completion_percentage > 50 THEN 1 END)::bigint as profiles_above_50_percent,
    COUNT(CASE WHEN pcp.completion_percentage > 75 THEN 1 END)::bigint as profiles_above_75_percent,
    (SELECT breakdown FROM resource_type_stats) as resource_type_breakdown
  FROM profile_completion_percentages pcp;
END;
$$;
