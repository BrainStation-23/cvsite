
-- Create a table for notes
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NULL REFERENCES public.note_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_notes_profile_id ON public.notes(profile_id);
CREATE INDEX idx_notes_category_id ON public.notes(category_id);
CREATE INDEX idx_notes_created_by ON public.notes(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins and managers to view all notes
CREATE POLICY "Admins and managers can view all notes" 
  ON public.notes 
  FOR SELECT 
  USING (is_admin_or_manager());

-- Create policy that allows admins and managers to create notes
CREATE POLICY "Admins and managers can create notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (is_admin_or_manager());

-- Create policy that allows admins and managers to update notes
CREATE POLICY "Admins and managers can update notes" 
  ON public.notes 
  FOR UPDATE 
  USING (is_admin_or_manager());

-- Create policy that allows admins and managers to delete notes
CREATE POLICY "Admins and managers can delete notes" 
  ON public.notes 
  FOR DELETE 
  USING (is_admin_or_manager());
