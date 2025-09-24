-- Create RPC function to duplicate a role with all its permissions
CREATE OR REPLACE FUNCTION public.duplicate_custom_role(
  source_role_id UUID,
  new_role_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_role_record RECORD;
  new_role_id UUID;
  final_role_name TEXT;
BEGIN
  -- Get the source role
  SELECT * INTO source_role_record
  FROM custom_roles
  WHERE id = source_role_id AND is_active = true;
  
  -- Check if source role exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source role not found or inactive';
  END IF;
  
  -- Generate the new role name
  IF new_role_name IS NULL THEN
    final_role_name := source_role_record.name || ' (Copy)';
  ELSE
    final_role_name := new_role_name;
  END IF;
  
  -- Create the new role
  INSERT INTO custom_roles (
    name,
    description,
    is_sbu_bound,
    is_system_role,
    created_by,
    is_active
  ) VALUES (
    final_role_name,
    source_role_record.description,
    source_role_record.is_sbu_bound,
    false, -- Duplicated roles are never system roles
    auth.uid(),
    true
  ) RETURNING id INTO new_role_id;
  
  -- Copy all permissions from source role to new role
  INSERT INTO role_permissions (
    role_id,
    module_id,
    sub_module_id,
    permission_type,
    sbu_restrictions
  )
  SELECT 
    new_role_id,
    rp.module_id,
    rp.sub_module_id,
    rp.permission_type,
    rp.sbu_restrictions
  FROM role_permissions rp
  WHERE rp.role_id = source_role_id;
  
  RETURN new_role_id;
END;
$$;