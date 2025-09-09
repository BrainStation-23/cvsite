-- Drop the existing get_bill_type_changes function
DROP FUNCTION IF EXISTS get_bill_type_changes(text, text, text[]);

-- Create updated get_bill_type_changes function with enhanced filtering and profile data
CREATE OR REPLACE FUNCTION get_bill_type_changes(
  start_date_param text DEFAULT NULL,
  end_date_param text DEFAULT NULL,
  bill_type_ids text[] DEFAULT NULL,
  sbu_ids text[] DEFAULT NULL,
  profile_ids text[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  profile_id uuid,
  old_bill_type_id uuid,
  old_bill_type_name text,
  new_bill_type_id uuid,
  new_bill_type_name text,
  project_id uuid,
  project_name text,
  changed_at timestamp with time zone,
  created_at timestamp with time zone,
  -- Profile information
  employee_id text,
  first_name text,
  last_name text,
  email text,
  date_of_joining date,
  career_start_date date,
  -- SBU information
  sbu_id uuid,
  sbu_name text,
  -- Expertise information
  expertise_id uuid,
  expertise_name text,
  -- Manager information
  manager_id uuid,
  manager_name text,
  manager_employee_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    btch.id,
    btch.profile_id,
    btch.old_bill_type_id,
    old_bt.name as old_bill_type_name,
    btch.new_bill_type_id,
    new_bt.name as new_bill_type_name,
    btch.project_id,
    pm.project_name,
    btch.changed_at,
    btch.created_at,
    -- Profile information
    p.employee_id,
    COALESCE(gi.first_name, p.first_name) as first_name,
    COALESCE(gi.last_name, p.last_name) as last_name,
    p.email,
    p.date_of_joining,
    p.career_start_date,
    -- SBU information
    p.sbu_id,
    s.name as sbu_name,
    -- Expertise information
    p.expertise as expertise_id,
    et.name as expertise_name,
    -- Manager information
    p.manager as manager_id,
    CONCAT(
      COALESCE(mgi.first_name, mp.first_name), ' ',
      COALESCE(mgi.last_name, mp.last_name)
    ) as manager_name,
    mp.employee_id as manager_employee_id
  FROM bill_type_change_history btch
  LEFT JOIN profiles p ON btch.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  LEFT JOIN bill_types old_bt ON btch.old_bill_type_id = old_bt.id
  LEFT JOIN bill_types new_bt ON btch.new_bill_type_id = new_bt.id
  LEFT JOIN projects_management pm ON btch.project_id = pm.id
  WHERE 
    (start_date_param IS NULL OR btch.changed_at::date >= start_date_param::date)
    AND (end_date_param IS NULL OR btch.changed_at::date <= end_date_param::date)
    AND (bill_type_ids IS NULL OR btch.old_bill_type_id = ANY(bill_type_ids::uuid[]) OR btch.new_bill_type_id = ANY(bill_type_ids::uuid[]))
    AND (sbu_ids IS NULL OR p.sbu_id = ANY(sbu_ids::uuid[]))
    AND (profile_ids IS NULL OR btch.profile_id = ANY(profile_ids::uuid[]))
  ORDER BY btch.changed_at DESC;
END;
$$;