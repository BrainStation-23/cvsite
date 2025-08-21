
-- Create function to get bill type change history with filters
CREATE OR REPLACE FUNCTION public.get_bill_type_changes(
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL,
  bill_type_ids uuid[] DEFAULT NULL,
  project_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  old_bill_type_id uuid,
  old_bill_type_name text,
  new_bill_type_id uuid,
  new_bill_type_name text,
  project_id uuid,
  project_name text,
  changed_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bh.id,
    bh.old_bill_type_id,
    old_bt.name as old_bill_type_name,
    bh.new_bill_type_id,
    new_bt.name as new_bill_type_name,
    bh.project_id,
    pm.project_name,
    bh.changed_at,
    bh.created_at
  FROM bill_type_change_history bh
  LEFT JOIN bill_types old_bt ON bh.old_bill_type_id = old_bt.id
  LEFT JOIN bill_types new_bt ON bh.new_bill_type_id = new_bt.id
  LEFT JOIN projects_management pm ON bh.project_id = pm.id
  WHERE (start_date_param IS NULL OR bh.changed_at::date >= start_date_param)
    AND (end_date_param IS NULL OR bh.changed_at::date <= end_date_param)
    AND (bill_type_ids IS NULL OR bh.old_bill_type_id = ANY(bill_type_ids) OR bh.new_bill_type_id = ANY(bill_type_ids))
    AND (project_ids IS NULL OR bh.project_id = ANY(project_ids))
  ORDER BY bh.changed_at DESC;
END;
$$;

-- Create function to get SBU change history with filters
CREATE OR REPLACE FUNCTION public.get_sbu_changes(
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL,
  sbu_ids uuid[] DEFAULT NULL,
  profile_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  profile_id uuid,
  employee_id text,
  first_name text,
  last_name text,
  old_sbu_id uuid,
  old_sbu_name text,
  new_sbu_id uuid,
  new_sbu_name text,
  changed_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.profile_id,
    p.employee_id,
    COALESCE(gi.first_name, p.first_name) as first_name,
    COALESCE(gi.last_name, p.last_name) as last_name,
    sh.old_sbu_id,
    old_sbu.name as old_sbu_name,
    sh.new_sbu_id,
    new_sbu.name as new_sbu_name,
    sh.changed_at,
    sh.created_at
  FROM sbu_change_history sh
  LEFT JOIN profiles p ON sh.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus old_sbu ON sh.old_sbu_id = old_sbu.id
  LEFT JOIN sbus new_sbu ON sh.new_sbu_id = new_sbu.id
  WHERE (start_date_param IS NULL OR sh.changed_at::date >= start_date_param)
    AND (end_date_param IS NULL OR sh.changed_at::date <= end_date_param)
    AND (sbu_ids IS NULL OR sh.old_sbu_id = ANY(sbu_ids) OR sh.new_sbu_id = ANY(sbu_ids))
    AND (profile_ids IS NULL OR sh.profile_id = ANY(profile_ids))
  ORDER BY sh.changed_at DESC;
END;
$$;

-- Create function to get resource changes summary statistics
CREATE OR REPLACE FUNCTION public.get_resource_changes_summary(
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH bill_type_changes AS (
    SELECT COUNT(*) as count
    FROM bill_type_change_history bh
    WHERE (start_date_param IS NULL OR bh.changed_at::date >= start_date_param)
      AND (end_date_param IS NULL OR bh.changed_at::date <= end_date_param)
  ),
  sbu_changes AS (
    SELECT COUNT(*) as count
    FROM sbu_change_history sh
    WHERE (start_date_param IS NULL OR sh.changed_at::date >= start_date_param)
      AND (end_date_param IS NULL OR sh.changed_at::date <= end_date_param)
  ),
  total_changes AS (
    SELECT (SELECT count FROM bill_type_changes) + (SELECT count FROM sbu_changes) as count
  ),
  recent_changes_7d AS (
    SELECT COUNT(*) as count
    FROM (
      SELECT changed_at FROM bill_type_change_history 
      WHERE changed_at >= CURRENT_DATE - INTERVAL '7 days'
      UNION ALL
      SELECT changed_at FROM sbu_change_history 
      WHERE changed_at >= CURRENT_DATE - INTERVAL '7 days'
    ) recent
  )
  SELECT json_build_object(
    'total_changes', (SELECT count FROM total_changes),
    'bill_type_changes', (SELECT count FROM bill_type_changes),
    'sbu_changes', (SELECT count FROM sbu_changes),
    'recent_changes_7d', (SELECT count FROM recent_changes_7d)
  ) INTO result;
  
  RETURN result;
END;
$$;
