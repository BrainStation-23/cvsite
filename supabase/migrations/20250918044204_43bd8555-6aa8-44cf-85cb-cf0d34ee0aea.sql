-- Update get_bill_type_changes function to use separate old/new bill type filters
CREATE OR REPLACE FUNCTION public.get_bill_type_changes(
  start_date_param text DEFAULT NULL::text, 
  end_date_param text DEFAULT NULL::text, 
  old_bill_type_ids text[] DEFAULT NULL::text[], 
  new_bill_type_ids text[] DEFAULT NULL::text[], 
  sbu_ids text[] DEFAULT NULL::text[], 
  profile_ids text[] DEFAULT NULL::text[]
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
  employee_id text, 
  first_name text, 
  last_name text, 
  email text, 
  date_of_joining date, 
  career_start_date date, 
  sbu_id uuid, 
  sbu_name text, 
  expertise_id uuid, 
  expertise_name text, 
  manager_id uuid, 
  manager_name text, 
  manager_employee_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$BEGIN
  RETURN QUERY
  WITH employee_changes AS (
    -- Get all changes within the date range for each employee
    SELECT 
      btch.profile_id,
      btch.old_bill_type_id,
      btch.new_bill_type_id,
      btch.project_id,
      btch.changed_at,
      btch.created_at,
      ROW_NUMBER() OVER (PARTITION BY btch.profile_id ORDER BY btch.changed_at ASC) as first_change,
      ROW_NUMBER() OVER (PARTITION BY btch.profile_id ORDER BY btch.changed_at DESC) as last_change
    FROM bill_type_change_history btch
    WHERE 
      (start_date_param IS NULL OR btch.changed_at::date >= start_date_param::date)
      AND (end_date_param IS NULL OR btch.changed_at::date <= end_date_param::date)
  ),
  employee_first_last AS (
    -- Get the original state (from first change) and final state (from last change)
    SELECT 
      first_change.profile_id,
      first_change.old_bill_type_id as original_bill_type_id, -- A in your A->F example
      last_change.new_bill_type_id as final_bill_type_id,     -- F in your A->F example
      last_change.project_id,
      last_change.changed_at as final_change_date,  -- Date of E->F transition
      last_change.created_at,
      -- Generate a synthetic ID for this consolidated record
      gen_random_uuid() as id
    FROM 
      (SELECT * FROM employee_changes WHERE first_change = 1) first_change
    JOIN 
      (SELECT * FROM employee_changes WHERE last_change = 1) last_change
    ON first_change.profile_id = last_change.profile_id
    -- Only include employees where there was actually a change (A != F)
    WHERE first_change.old_bill_type_id != last_change.new_bill_type_id
  )
  SELECT 
    efl.id,
    efl.profile_id,
    efl.original_bill_type_id as old_bill_type_id,
    old_bt.name as old_bill_type_name,
    efl.final_bill_type_id as new_bill_type_id,
    new_bt.name as new_bill_type_name,
    efl.project_id,
    pm.project_name,
    efl.final_change_date as changed_at,
    efl.created_at,
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
  FROM employee_first_last efl
  LEFT JOIN profiles p ON efl.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  LEFT JOIN profiles mp ON p.manager = mp.id
  LEFT JOIN general_information mgi ON mp.id = mgi.profile_id
  LEFT JOIN bill_types old_bt ON efl.original_bill_type_id = old_bt.id
  LEFT JOIN bill_types new_bt ON efl.final_bill_type_id = new_bt.id
  LEFT JOIN projects_management pm ON efl.project_id = pm.id
  WHERE 
    -- Apply filters on the final consolidated data
    (old_bill_type_ids IS NULL OR efl.original_bill_type_id = ANY(old_bill_type_ids::uuid[]))
    AND (new_bill_type_ids IS NULL OR efl.final_bill_type_id = ANY(new_bill_type_ids::uuid[]))
    AND (sbu_ids IS NULL OR p.sbu_id = ANY(sbu_ids::uuid[]))
    AND (profile_ids IS NULL OR efl.profile_id = ANY(profile_ids::uuid[]))
  ORDER BY efl.final_change_date DESC;
END;$function$

-- Add get_sbu_changes function to use separate old/new SBU filters
CREATE OR REPLACE FUNCTION public.get_sbu_changes(
  start_date_param text DEFAULT NULL::text, 
  end_date_param text DEFAULT NULL::text, 
  old_sbu_ids text[] DEFAULT NULL::text[], 
  new_sbu_ids text[] DEFAULT NULL::text[], 
  profile_ids text[] DEFAULT NULL::text[]
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
AS $function$BEGIN
  RETURN QUERY
  SELECT 
    sch.id,
    sch.profile_id,
    p.employee_id,
    COALESCE(gi.first_name, p.first_name) as first_name,
    COALESCE(gi.last_name, p.last_name) as last_name,
    sch.old_sbu_id,
    old_sbu.name as old_sbu_name,
    sch.new_sbu_id,
    new_sbu.name as new_sbu_name,
    sch.changed_at,
    sch.created_at
  FROM sbu_change_history sch
  LEFT JOIN profiles p ON sch.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus old_sbu ON sch.old_sbu_id = old_sbu.id
  LEFT JOIN sbus new_sbu ON sch.new_sbu_id = new_sbu.id
  WHERE 
    (start_date_param IS NULL OR sch.changed_at::date >= start_date_param::date)
    AND (end_date_param IS NULL OR sch.changed_at::date <= end_date_param::date)
    AND (old_sbu_ids IS NULL OR sch.old_sbu_id = ANY(old_sbu_ids::uuid[]))
    AND (new_sbu_ids IS NULL OR sch.new_sbu_id = ANY(new_sbu_ids::uuid[]))
    AND (profile_ids IS NULL OR sch.profile_id = ANY(profile_ids::uuid[]))
  ORDER BY sch.changed_at DESC;
END;$function$