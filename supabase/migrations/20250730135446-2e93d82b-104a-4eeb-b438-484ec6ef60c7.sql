
-- Create SBU-filtered functions for resource distribution statistics

-- Function to get resource distribution by bill types for a specific SBU
CREATE OR REPLACE FUNCTION public.get_sbu_resource_distribution_by_bill_types(sbu_filter uuid DEFAULT NULL)
RETURNS TABLE(bill_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(bt.name, 'Unassigned') as bill_type,
    COUNT(DISTINCT rp.profile_id) as count
  FROM resource_planning rp
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  LEFT JOIN profiles p ON rp.profile_id = p.id
  WHERE rp.engagement_complete = false
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  GROUP BY bt.name
  ORDER BY count DESC;
END;
$function$;

-- Function to get resource distribution by resource types for a specific SBU
CREATE OR REPLACE FUNCTION public.get_sbu_resource_distribution_by_resource_types(sbu_filter uuid DEFAULT NULL)
RETURNS TABLE(resource_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(rt.name, 'Unspecified') as resource_type,
    COUNT(*) as count
  FROM profiles p
  LEFT JOIN resource_types rt ON p.resource_type = rt.id
  WHERE (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  GROUP BY rt.name
  ORDER BY count DESC;
END;
$function$;

-- Function to get resource distribution by project types for a specific SBU
CREATE OR REPLACE FUNCTION public.get_sbu_resource_distribution_by_project_types(sbu_filter uuid DEFAULT NULL)
RETURNS TABLE(project_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(pt.name, 'Unassigned') as project_type,
    COUNT(DISTINCT rp.profile_id) as count
  FROM resource_planning rp
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN project_types pt ON pm.project_type = pt.id
  LEFT JOIN profiles p ON rp.profile_id = p.id
  WHERE rp.engagement_complete = false
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  GROUP BY pt.name
  ORDER BY count DESC;
END;
$function$;

-- Function to get resource distribution by expertise types for a specific SBU
CREATE OR REPLACE FUNCTION public.get_sbu_resource_distribution_by_expertise_types(sbu_filter uuid DEFAULT NULL)
RETURNS TABLE(expertise_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(et.name, 'Unspecified') as expertise_type,
    COUNT(*) as count
  FROM profiles p
  LEFT JOIN expertise_types et ON p.expertise = et.id
  WHERE (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  GROUP BY et.name
  ORDER BY count DESC;
END;
$function$;

-- Function to get SBU summary statistics
CREATE OR REPLACE FUNCTION public.get_sbu_summary_stats(sbu_filter uuid DEFAULT NULL)
RETURNS TABLE(
  total_resources bigint,
  active_projects bigint,
  avg_engagement_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles p WHERE (sbu_filter IS NULL OR p.sbu_id = sbu_filter)) as total_resources,
    (SELECT COUNT(DISTINCT rp.project_id) 
     FROM resource_planning rp 
     LEFT JOIN profiles p ON rp.profile_id = p.id
     WHERE rp.engagement_complete = false 
       AND rp.project_id IS NOT NULL
       AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)) as active_projects,
    (SELECT COALESCE(AVG(rp.engagement_percentage), 0)::numeric(5,2)
     FROM resource_planning rp 
     LEFT JOIN profiles p ON rp.profile_id = p.id
     WHERE rp.engagement_complete = false 
       AND rp.engagement_percentage IS NOT NULL
       AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)) as avg_engagement_percentage;
END;
$function$;
