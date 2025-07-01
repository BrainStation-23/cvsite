
-- Create projects table with minimal information
CREATE TABLE public.projects_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_manager TEXT,
  client_name TEXT,
  budget DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_planning table
CREATE TABLE public.resource_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL, -- Reference to profiles table (not enforced constraint)
  resource_type_id UUID, -- Reference to resource_types table
  project_id UUID, -- Reference to projects_management table
  engagement_percentage INTEGER CHECK (engagement_percentage >= 1 AND engagement_percentage <= 100),
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_resource_planning_resource_type 
    FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id),
  CONSTRAINT fk_resource_planning_project 
    FOREIGN KEY (project_id) REFERENCES public.projects_management(id)
);

-- Add Row Level Security (RLS) to projects_management table
ALTER TABLE public.projects_management ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects_management
CREATE POLICY "Admins and managers can manage projects" 
  ON public.projects_management 
  FOR ALL 
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "All authenticated users can view projects" 
  ON public.projects_management 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Add Row Level Security (RLS) to resource_planning table
ALTER TABLE public.resource_planning ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resource_planning
CREATE POLICY "Admins and managers can manage resource planning" 
  ON public.resource_planning 
  FOR ALL 
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "Users can view their own resource planning" 
  ON public.resource_planning 
  FOR SELECT 
  USING (profile_id = auth.uid() OR is_admin_or_manager());

-- Create indexes for better performance
CREATE INDEX idx_resource_planning_profile_id ON public.resource_planning(profile_id);
CREATE INDEX idx_resource_planning_resource_type_id ON public.resource_planning(resource_type_id);
CREATE INDEX idx_resource_planning_project_id ON public.resource_planning(project_id);
CREATE INDEX idx_projects_management_project_name ON public.projects_management(project_name);

-- Create RPC function to fetch resource planning data
CREATE OR REPLACE FUNCTION public.get_resource_planning_data(
  search_query TEXT DEFAULT NULL,
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
  resource_planning_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  resource_planning_array JSON;
BEGIN
  -- Calculate total resource planning records count (unfiltered)
  SELECT COUNT(*)
  INTO total_count
  FROM resource_planning rp;
  
  -- Count filtered results
  SELECT COUNT(DISTINCT rp.id)
  INTO filtered_count
  FROM resource_planning rp
  LEFT JOIN profiles p ON rp.profile_id = p.id
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN resource_types rt ON rp.resource_type_id = rt.id
  LEFT JOIN projects_management pm ON rp.project_id = pm.id
  WHERE (
    search_query IS NULL
    OR p.first_name ILIKE '%' || search_query || '%'
    OR p.last_name ILIKE '%' || search_query || '%'
    OR p.employee_id ILIKE '%' || search_query || '%'
    OR gi.first_name ILIKE '%' || search_query || '%'
    OR gi.last_name ILIKE '%' || search_query || '%'
    OR rt.name ILIKE '%' || search_query || '%'
    OR pm.project_name ILIKE '%' || search_query || '%'
    OR pm.client_name ILIKE '%' || search_query || '%'
    OR pm.project_manager ILIKE '%' || search_query || '%'
  );
  
  -- Build resource planning query with proper sorting and pagination
  SELECT json_agg(row_to_json(rp_data))
  INTO resource_planning_array
  FROM (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.release_date,
      rp.created_at,
      rp.updated_at,
      -- Profile information
      json_build_object(
        'id', p.id,
        'employee_id', p.employee_id,
        'first_name', COALESCE(gi.first_name, p.first_name),
        'last_name', COALESCE(gi.last_name, p.last_name),
        'current_designation', gi.current_designation
      ) as profile,
      -- Resource type information
      json_build_object(
        'id', rt.id,
        'name', rt.name
      ) as resource_type,
      -- Project information
      json_build_object(
        'id', pm.id,
        'project_name', pm.project_name,
        'project_manager', pm.project_manager,
        'client_name', pm.client_name,
        'budget', pm.budget
      ) as project
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN resource_types rt ON rp.resource_type_id = rt.id
    LEFT JOIN projects_management pm ON rp.project_id = pm.id
    WHERE (
      search_query IS NULL
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
      OR p.employee_id ILIKE '%' || search_query || '%'
      OR gi.first_name ILIKE '%' || search_query || '%'
      OR gi.last_name ILIKE '%' || search_query || '%'
      OR rt.name ILIKE '%' || search_query || '%'
      OR pm.project_name ILIKE '%' || search_query || '%'
      OR pm.client_name ILIKE '%' || search_query || '%'
      OR pm.project_manager ILIKE '%' || search_query || '%'
    )
    ORDER BY
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'asc' THEN COALESCE(gi.first_name, p.first_name) END ASC,
      CASE WHEN sort_by = 'profile_name' AND sort_order = 'desc' THEN COALESCE(gi.first_name, p.first_name) END DESC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN pm.project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN pm.project_name END DESC,
      CASE WHEN sort_by = 'resource_type' AND sort_order = 'asc' THEN rt.name END ASC,
      CASE WHEN sort_by = 'resource_type' AND sort_order = 'desc' THEN rt.name END DESC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'asc' THEN rp.engagement_percentage END ASC,
      CASE WHEN sort_by = 'engagement_percentage' AND sort_order = 'desc' THEN rp.engagement_percentage END DESC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'asc' THEN rp.release_date END ASC,
      CASE WHEN sort_by = 'release_date' AND sort_order = 'desc' THEN rp.release_date END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN rp.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN rp.created_at END DESC,
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('profile_name', 'project_name', 'resource_type', 'engagement_percentage', 'release_date', 'created_at')) 
        AND (sort_order IS NULL OR sort_order = 'desc') THEN rp.created_at END DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) AS rp_data;
  
  -- Build final result JSON
  SELECT json_build_object(
    'resource_planning', COALESCE(resource_planning_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO resource_planning_data;
  
  RETURN resource_planning_data;
END;
$$;
