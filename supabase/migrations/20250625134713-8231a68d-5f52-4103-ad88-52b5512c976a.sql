
-- Create a table for note categories
CREATE TABLE public.note_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint on name to prevent duplicates
ALTER TABLE public.note_categories ADD CONSTRAINT note_categories_name_unique UNIQUE (name);

-- Enable Row Level Security (RLS) - only admins should manage categories
ALTER TABLE public.note_categories ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to view note categories
CREATE POLICY "Only admins can view note categories" 
  ON public.note_categories 
  FOR SELECT 
  USING (is_admin());

-- Create policy that allows only admins to create note categories
CREATE POLICY "Only admins can create note categories" 
  ON public.note_categories 
  FOR INSERT 
  WITH CHECK (is_admin());

-- Create policy that allows only admins to update note categories
CREATE POLICY "Only admins can update note categories" 
  ON public.note_categories 
  FOR UPDATE 
  USING (is_admin());

-- Create policy that allows only admins to delete note categories
CREATE POLICY "Only admins can delete note categories" 
  ON public.note_categories 
  FOR DELETE 
  USING (is_admin());
