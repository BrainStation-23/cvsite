-- Fix security warnings for newly created functions by setting search_path

-- Update the trigger function
CREATE OR REPLACE FUNCTION public.audit_cv_data_changes()
RETURNS TRIGGER AS $$
DECLARE
  profile_uuid UUID;
  changed_fields_array TEXT[] := '{}';
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Determine profile_id based on table structure
  IF TG_TABLE_NAME = 'general_information' THEN
    profile_uuid := COALESCE(NEW.profile_id, OLD.profile_id);
  ELSE
    profile_uuid := COALESCE(NEW.profile_id, OLD.profile_id);
  END IF;

  -- For UPDATE operations, determine which fields changed
  IF TG_OP = 'UPDATE' THEN
    -- Compare each field and build changed_fields array
    FOR field_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = TG_TABLE_NAME
        AND column_name NOT IN ('id', 'created_at', 'updated_at')
    LOOP
      EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_name, field_name) 
        INTO old_val, new_val 
        USING OLD, NEW;
      
      IF old_val IS DISTINCT FROM new_val THEN
        changed_fields_array := array_append(changed_fields_array, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insert audit record
  INSERT INTO public.cv_data_audit_logs (
    table_name,
    record_id,
    profile_id,
    operation_type,
    changed_by,
    old_data,
    new_data,
    changed_fields
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    profile_uuid,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN changed_fields_array ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the get_cv_audit_history function
CREATE OR REPLACE FUNCTION public.get_cv_audit_history(
  target_profile_id UUID,
  limit_records INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  table_name TEXT,
  record_id UUID,
  operation_type TEXT,
  changed_by UUID,
  changed_by_name TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cal.id,
    cal.table_name,
    cal.record_id,
    cal.operation_type,
    cal.changed_by,
    CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) as changed_by_name,
    cal.old_data,
    cal.new_data,
    cal.changed_fields,
    cal.changed_at
  FROM public.cv_data_audit_logs cal
  LEFT JOIN public.profiles p ON cal.changed_by = p.id
  WHERE cal.profile_id = target_profile_id
  ORDER BY cal.changed_at DESC
  LIMIT limit_records;
END;
$$;

-- Update the get_recent_cv_changes function
CREATE OR REPLACE FUNCTION public.get_recent_cv_changes(
  limit_records INTEGER DEFAULT 100
)
RETURNS TABLE(
  id UUID,
  table_name TEXT,
  record_id UUID,
  profile_id UUID,
  profile_name TEXT,
  operation_type TEXT,
  changed_by UUID,
  changed_by_name TEXT,
  changed_fields TEXT[],
  changed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin or manager
  IF NOT is_admin_or_manager() THEN
    RAISE EXCEPTION 'Access denied. Admin or manager role required.';
  END IF;

  RETURN QUERY
  SELECT 
    cal.id,
    cal.table_name,
    cal.record_id,
    cal.profile_id,
    CONCAT(COALESCE(profile.first_name, ''), ' ', COALESCE(profile.last_name, '')) as profile_name,
    cal.operation_type,
    cal.changed_by,
    CONCAT(COALESCE(changer.first_name, ''), ' ', COALESCE(changer.last_name, '')) as changed_by_name,
    cal.changed_fields,
    cal.changed_at
  FROM public.cv_data_audit_logs cal
  LEFT JOIN public.profiles profile ON cal.profile_id = profile.id
  LEFT JOIN public.profiles changer ON cal.changed_by = changer.id
  ORDER BY cal.changed_at DESC
  LIMIT limit_records;
END;
$$;