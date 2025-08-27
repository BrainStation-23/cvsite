
-- Create the performance_improvement_plans table
CREATE TABLE public.performance_improvement_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_feedback TEXT,
  start_date DATE NOT NULL,
  mid_date DATE,
  end_date DATE NOT NULL,
  final_review TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint to ensure end_date is after start_date
ALTER TABLE public.performance_improvement_plans 
ADD CONSTRAINT check_end_date_after_start 
CHECK (end_date > start_date);

-- Add constraint to ensure mid_date is between start and end dates
ALTER TABLE public.performance_improvement_plans 
ADD CONSTRAINT check_mid_date_between_start_end 
CHECK (mid_date IS NULL OR (mid_date > start_date AND mid_date < end_date));

-- Enable Row Level Security
ALTER TABLE public.performance_improvement_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins and managers can view all PIPs
CREATE POLICY "Admins and managers can view all PIPs" 
ON public.performance_improvement_plans 
FOR SELECT 
USING (is_admin_or_manager());

-- Employees can view their own PIPs
CREATE POLICY "Employees can view their own PIPs" 
ON public.performance_improvement_plans 
FOR SELECT 
USING (profile_id = auth.uid());

-- Only admins and managers can create PIPs
CREATE POLICY "Admins and managers can create PIPs" 
ON public.performance_improvement_plans 
FOR INSERT 
WITH CHECK (is_admin_or_manager());

-- Only admins and managers can update PIPs
CREATE POLICY "Admins and managers can update PIPs" 
ON public.performance_improvement_plans 
FOR UPDATE 
USING (is_admin_or_manager());

-- Only admins can delete PIPs
CREATE POLICY "Only admins can delete PIPs" 
ON public.performance_improvement_plans 
FOR DELETE 
USING (is_admin());

-- Create search function for PIPs with comprehensive filtering
CREATE OR REPLACE FUNCTION public.search_pips(
  search_query TEXT DEFAULT NULL,
  sbu_filter UUID DEFAULT NULL,
  expertise_filter UUID DEFAULT NULL,
  manager_filter UUID DEFAULT NULL,
  designation_filter TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  items_per_page INTEGER DEFAULT 10,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pips_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  pips_array JSON;
BEGIN
  -- Calculate total PIPs count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM performance_improvement_plans pip;
  
  -- Count filtered results
  SELECT COUNT(*)
  INTO filtered_count
  FROM performance_improvement_plans pip
  LEFT JOIN profiles p ON pip.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN profiles manager_p ON p.manager = manager_p.id
  LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id
  WHERE (
    search_query IS NULL 
    OR COALESCE(gi.first_name, p.first_name) ILIKE '%' || search_query || '%'
    OR COALESCE(gi.last_name, p.last_name) ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.current_designation ILIKE '%' || search_query || '%'
    OR s.name ILIKE '%' || search_query || '%'
  )
  AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  AND (expertise_filter IS NULL OR p.expertise = expertise_filter)
  AND (manager_filter IS NULL OR p.manager = manager_filter)
  AND (designation_filter IS NULL OR gi.current_designation ILIKE '%' || designation_filter || '%')
  AND (status_filter IS NULL OR pip.status = status_filter);
  
  -- Build PIPs query with comprehensive data, sorting and pagination
  SELECT json_agg(
    json_build_object(
      'pip_id', pip.id,
      'profile_id', pip.profile_id,
      'status', pip.status,
      'start_date', pip.start_date,
      'mid_date', pip.mid_date,
      'end_date', pip.end_date,
      'created_at', pip.created_at,
      'updated_at', pip.updated_at,
      'employee_name', CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)),
      'employee_id', p.employee_id,
      'designation', gi.current_designation,
      'profile_image', gi.profile_image,
      'sbu_name', s.name,
      'sbu_id', s.id,
      'expertise_name', et.name,
      'expertise_id', et.id,
      'manager_name', CASE 
        WHEN manager_p.id IS NOT NULL THEN
          CONCAT(COALESCE(manager_gi.first_name, manager_p.first_name), ' ', COALESCE(manager_gi.last_name, manager_p.last_name))
        ELSE NULL
      END,
      'manager_id', p.manager
    )
    ORDER BY
      CASE WHEN sort_by = 'employee_name' AND sort_order = 'asc' THEN CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)) END ASC,
      CASE WHEN sort_by = 'employee_name' AND sort_order = 'desc' THEN CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)) END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'start_date' AND sort_order = 'asc' THEN pip.start_date END ASC,
      CASE WHEN sort_by = 'start_date' AND sort_order = 'desc' THEN pip.start_date END DESC,
      CASE WHEN sort_by = 'end_date' AND sort_order = 'asc' THEN pip.end_date END ASC,
      CASE WHEN sort_by = 'end_date' AND sort_order = 'desc' THEN pip.end_date END DESC,
      CASE WHEN sort_by = 'status' AND sort_order = 'asc' THEN pip.status END ASC,
      CASE WHEN sort_by = 'status' AND sort_order = 'desc' THEN pip.status END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN pip.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN pip.created_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('employee_name', 'employee_id', 'start_date', 'end_date', 'status', 'created_at')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN pip.created_at END DESC
  )
  INTO pips_array
  FROM (
    SELECT pip.*
    FROM performance_improvement_plans pip
    LEFT JOIN profiles p ON pip.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN profiles manager_p ON p.manager = manager_p.id
    LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE (
      search_query IS NULL 
      OR COALESCE(gi.first_name, p.first_name) ILIKE '%' || search_query || '%'
      OR COALESCE(gi.last_name, p.last_name) ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.current_designation ILIKE '%' || search_query || '%'
      OR s.name ILIKE '%' || search_query || '%'
    )
    AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
    AND (expertise_filter IS NULL OR p.expertise = expertise_filter)
    AND (manager_filter IS NULL OR p.manager = manager_filter)
    AND (designation_filter IS NULL OR gi.current_designation ILIKE '%' || designation_filter || '%')
    AND (status_filter IS NULL OR pip.status = status_filter)
    ORDER BY
      CASE WHEN sort_by = 'employee_name' AND sort_order = 'asc' THEN CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)) END ASC,
      CASE WHEN sort_by = 'employee_name' AND sort_order = 'desc' THEN CONCAT(COALESCE(gi.first_name, p.first_name), ' ', COALESCE(gi.last_name, p.last_name)) END DESC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'asc' THEN p.employee_id END ASC,
      CASE WHEN sort_by = 'employee_id' AND sort_order = 'desc' THEN p.employee_id END DESC,
      CASE WHEN sort_by = 'start_date' AND sort_order = 'asc' THEN pip.start_date END ASC,
      CASE WHEN sort_by = 'start_date' AND sort_order = 'desc' THEN pip.start_date END DESC,
      CASE WHEN sort_by = 'end_date' AND sort_order = 'asc' THEN pip.end_date END ASC,
      CASE WHEN sort_by = 'end_date' AND sort_order = 'desc' THEN pip.end_date END DESC,
      CASE WHEN sort_by = 'status' AND sort_order = 'asc' THEN pip.status END ASC,
      CASE WHEN sort_by = 'status' AND sort_order = 'desc' THEN pip.status END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN pip.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN pip.created_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('employee_name', 'employee_id', 'start_date', 'end_date', 'status', 'created_at')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN pip.created_at END DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) pip
  LEFT JOIN profiles p ON pip.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN profiles manager_p ON p.manager = manager_p.id
  LEFT JOIN general_information manager_gi ON manager_p.id = manager_gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  LEFT JOIN expertise_types et ON p.expertise = et.id;
  
  -- Build final result JSON
  SELECT json_build_object(
    'pips', COALESCE(pips_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO pips_data;
  
  RETURN pips_data;
END;
$$;
