
-- Create bill_type table
CREATE TABLE public.bill_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to bill_types table
ALTER TABLE public.bill_types ENABLE ROW LEVEL SECURITY;

-- Create policies for bill_types (same as resource_types)
CREATE POLICY "Everyone can view bill types" 
  ON public.bill_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create bill types" 
  ON public.bill_types 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update bill types" 
  ON public.bill_types 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete bill types" 
  ON public.bill_types 
  FOR DELETE 
  USING (is_admin());

-- Create project_type table
CREATE TABLE public.project_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to project_types table
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- Create policies for project_types (same as resource_types)
CREATE POLICY "Everyone can view project types" 
  ON public.project_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create project types" 
  ON public.project_types 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update project types" 
  ON public.project_types 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete project types" 
  ON public.project_types 
  FOR DELETE 
  USING (is_admin());
