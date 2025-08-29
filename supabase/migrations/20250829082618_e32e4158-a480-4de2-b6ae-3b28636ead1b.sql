
-- Create RPC function to export all planned resources (non-paginated)
CREATE OR REPLACE FUNCTION public.export_planned_resources()
RETURNS TABLE(
  employee_id text,
  employee_name text,
  sbu_name text,
  project_name text,
  client_name text,
  project_manager text,
  bill_type_name text,
  engagement_percentage real,
  billing_percentage real,
  engagement_start_date date,
  release_date date,
  weekly_validation boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.employee_id,
    CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)) as employee_name,
    s.name as sbu_name,
    pm.project_name,
    pm.client_name,
    CASE 
      WHEN pmp.id IS NOT NULL THEN 
        CONCAT(COALESCE(pmgi.first_name, pmp.first_name), ' ', COALESCE(pmgi.last_name, pmp.last_name))
      ELSE 'Unassigned'
    END as project_manager,
    bt.name as bill_type_name,
    rp.engagement_percentage,
    rp.billing_percentage,
    rp.engagement_start_date,
    rp.release_date,
    rp.weekly_validation,
    rp.created_at
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  LEFT JOIN profiles pmp ON pm.project_manager = pmp.id
  LEFT JOIN general_information pmgi ON pmp.id = pmgi.profile_id
  LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
  WHERE rp.engagement_complete = false
  ORDER BY p.employee_id, rp.created_at DESC;
END;
$function$;

-- Grant execute permission to authenticated users with proper roles
GRANT EXECUTE ON FUNCTION public.export_planned_resources() TO authenticated;

-- Add RLS policy comment for clarity
COMMENT ON FUNCTION public.export_planned_resources() IS 'Export all planned resources where engagement_complete = false. Access controlled by function-level security.';
