-- Phase 1: Update user_roles table structure for custom roles
-- Add missing columns to user_roles table if they don't exist
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS custom_role_id uuid REFERENCES public.custom_roles(id),
ADD COLUMN IF NOT EXISTS sbu_context uuid REFERENCES public.sbus(id),
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone DEFAULT now();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_custom_role_id ON public.user_roles(custom_role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_sbu_context ON public.user_roles(sbu_context);

-- Create helper function to validate custom role assignment
CREATE OR REPLACE FUNCTION public.validate_custom_role_assignment(
  _custom_role_id uuid,
  _sbu_context uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_is_sbu_bound boolean;
BEGIN
  -- Get role information
  SELECT is_sbu_bound INTO role_is_sbu_bound
  FROM public.custom_roles
  WHERE id = _custom_role_id AND is_active = true;
  
  -- If role doesn't exist or is not active, return false
  IF role_is_sbu_bound IS NULL THEN
    RETURN false;
  END IF;
  
  -- If role is SBU-bound, SBU context must be provided
  IF role_is_sbu_bound AND _sbu_context IS NULL THEN
    RETURN false;
  END IF;
  
  -- If role is not SBU-bound, SBU context should be NULL
  IF NOT role_is_sbu_bound AND _sbu_context IS NOT NULL THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to assign custom role to user
CREATE OR REPLACE FUNCTION public.assign_custom_role_to_user(
  _user_id uuid,
  _custom_role_id uuid,
  _sbu_context uuid DEFAULT NULL,
  _assigned_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate the role assignment
  IF NOT public.validate_custom_role_assignment(_custom_role_id, _sbu_context) THEN
    RAISE EXCEPTION 'Invalid role assignment: SBU context mismatch for role';
  END IF;
  
  -- Remove existing role for this user
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Insert new custom role
  INSERT INTO public.user_roles (
    user_id,
    custom_role_id,
    sbu_context,
    assigned_by,
    assigned_at
  ) VALUES (
    _user_id,
    _custom_role_id,
    _sbu_context,
    COALESCE(_assigned_by, auth.uid()),
    now()
  );
END;
$$;