-- Create RPC function to get resource distribution by bill types
CREATE OR REPLACE FUNCTION public.get_resource_distribution_by_bill_types()
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
  WHERE rp.engagement_complete = false
  GROUP BY bt.name
  ORDER BY count DESC;
END;
$function$;

-- Create RPC function to get resource distribution by expertise types
CREATE OR REPLACE FUNCTION public.get_resource_distribution_by_expertise_types()
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
  GROUP BY et.name
  ORDER BY count DESC;
END;
$function$;

-- Create RPC function to get resource distribution by project types
CREATE OR REPLACE FUNCTION public.get_resource_distribution_by_project_types()
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
  WHERE rp.engagement_complete = false
  GROUP BY pt.name
  ORDER BY count DESC;
END;
$function$;

-- Create RPC function to get resource distribution by resource types
CREATE OR REPLACE FUNCTION public.get_resource_distribution_by_resource_types()
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
  GROUP BY rt.name
  ORDER BY count DESC;
END;
$function$;

-- Create RPC function to get resource distribution by SBU
CREATE OR REPLACE FUNCTION public.get_resource_distribution_by_sbu()
RETURNS TABLE(sbu_name text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.name, 'Unassigned') as sbu_name,
    COUNT(*) as count
  FROM profiles p
  LEFT JOIN sbus s ON p.sbu_id = s.id
  GROUP BY s.name
  ORDER BY count DESC;
END;
$function$;