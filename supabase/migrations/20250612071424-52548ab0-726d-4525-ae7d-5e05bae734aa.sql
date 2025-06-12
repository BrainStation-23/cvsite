
-- Create HR Contacts table
CREATE TABLE public.hr_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on email to prevent duplicates
ALTER TABLE public.hr_contacts ADD CONSTRAINT hr_contacts_email_unique UNIQUE (email);

-- Add Row Level Security (RLS) - typically HR contacts would be admin-only
ALTER TABLE public.hr_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage HR contacts" 
  ON public.hr_contacts 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
