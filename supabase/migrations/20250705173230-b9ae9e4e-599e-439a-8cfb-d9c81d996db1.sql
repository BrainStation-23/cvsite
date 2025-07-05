
-- Create expertise_types table
CREATE TABLE public.expertise_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.expertise_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies similar to resource_types
CREATE POLICY "Everyone can view expertise types" 
  ON public.expertise_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create expertise types" 
  ON public.expertise_types 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update expertise types" 
  ON public.expertise_types 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete expertise types" 
  ON public.expertise_types 
  FOR DELETE 
  USING (is_admin());
