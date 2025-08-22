
-- Create table to track forced image uploads with validation errors
CREATE TABLE public.forced_image_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  upload_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.forced_image_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins and managers can view forced uploads" 
  ON public.forced_image_uploads 
  FOR SELECT 
  USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can create forced upload records" 
  ON public.forced_image_uploads 
  FOR INSERT 
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "Users can view their own forced upload records" 
  ON public.forced_image_uploads 
  FOR SELECT 
  USING (profile_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_forced_image_uploads_profile_id ON public.forced_image_uploads(profile_id);
CREATE INDEX idx_forced_image_uploads_uploaded_by ON public.forced_image_uploads(uploaded_by_user_id);
CREATE INDEX idx_forced_image_uploads_timestamp ON public.forced_image_uploads(upload_timestamp DESC);

-- Add comments for documentation
COMMENT ON TABLE public.forced_image_uploads IS 'Tracks profile image uploads that were forced despite validation errors';
COMMENT ON COLUMN public.forced_image_uploads.profile_id IS 'ID of the profile whose image was uploaded';
COMMENT ON COLUMN public.forced_image_uploads.uploaded_by_user_id IS 'ID of the user who performed the forced upload';
COMMENT ON COLUMN public.forced_image_uploads.validation_errors IS 'JSON array of validation errors that were ignored';
COMMENT ON COLUMN public.forced_image_uploads.image_url IS 'URL of the uploaded image';
COMMENT ON COLUMN public.forced_image_uploads.upload_timestamp IS 'When the forced upload occurred';
