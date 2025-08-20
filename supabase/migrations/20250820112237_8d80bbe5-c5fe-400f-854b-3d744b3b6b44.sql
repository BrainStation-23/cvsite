
-- Create RPC function to get profile completion statistics by resource type (fixed version)
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
  WITH profile_completion AS (
    SELECT 
      p.id as profile_id,
      rt.id as resource_type_id,
      COALESCE(rt.name, 'Unspecified') as resource_type_name,
      CASE 
        WHEN EXISTS (SELECT 1 FROM general_information gi WHERE gi.profile_id = p.id)
        THEN 1 
        ELSE 0 
      END as is_completed
    FROM profiles p
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
  )
  SELECT 
    pc.resource_type_id,
    pc.resource_type_name,
    COUNT(*)::bigint as total_profiles,
    SUM(pc.is_completed)::bigint as completed_profiles,
    (COUNT(*) - SUM(pc.is_completed))::bigint as incomplete_profiles,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((SUM(pc.is_completed)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0::numeric
    END as completion_rate
  FROM profile_completion pc
  GROUP BY pc.resource_type_id, pc.resource_type_name
  ORDER BY pc.resource_type_name NULLS LAST;
END;
$$;
