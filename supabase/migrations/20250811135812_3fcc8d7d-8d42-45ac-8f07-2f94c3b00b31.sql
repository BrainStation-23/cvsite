
-- Create CV templates table
CREATE TABLE public.cv_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  html_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.cv_templates ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage CV templates
CREATE POLICY "Only admins can view CV templates" 
  ON public.cv_templates 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "Only admins can create CV templates" 
  ON public.cv_templates 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update CV templates" 
  ON public.cv_templates 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete CV templates" 
  ON public.cv_templates 
  FOR DELETE 
  USING (is_admin());

-- Add a comment to document the table
COMMENT ON TABLE public.cv_templates IS 'Stores CV template definitions with HTML content for generating customized resumes';
