
-- Create table for managing CV preview tokens
CREATE TABLE public.cv_preview_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.cv_templates(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NULL, -- NULL means unlimited usage
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster token lookups
CREATE INDEX idx_cv_preview_tokens_token ON public.cv_preview_tokens(token);
CREATE INDEX idx_cv_preview_tokens_expires_at ON public.cv_preview_tokens(expires_at);
CREATE INDEX idx_cv_preview_tokens_profile_template ON public.cv_preview_tokens(profile_id, template_id);

-- Enable RLS
ALTER TABLE public.cv_preview_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and managers can manage CV preview tokens" 
  ON public.cv_preview_tokens 
  FOR ALL 
  USING (is_admin_or_manager()) 
  WITH CHECK (is_admin_or_manager());

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_cv_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.cv_preview_tokens 
  WHERE expires_at < now() OR is_active = false;
END;
$$;

-- Create function to increment token usage
CREATE OR REPLACE FUNCTION public.increment_token_usage(token_value TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token record and check validity
  SELECT * INTO token_record
  FROM public.cv_preview_tokens
  WHERE token = token_value
    AND is_active = true
    AND expires_at > now();
  
  -- Return false if token not found or expired
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check usage limits
  IF token_record.max_usage IS NOT NULL AND token_record.usage_count >= token_record.max_usage THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage count
  UPDATE public.cv_preview_tokens
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE token = token_value;
  
  RETURN TRUE;
END;
$$;
