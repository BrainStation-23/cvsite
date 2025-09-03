-- Create CV Data Audit Logs Table
CREATE TABLE public.cv_data_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,  
  profile_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_cv_audit_logs_profile_id ON public.cv_data_audit_logs(profile_id);
CREATE INDEX idx_cv_audit_logs_table_name ON public.cv_data_audit_logs(table_name);
CREATE INDEX idx_cv_audit_logs_changed_at ON public.cv_data_audit_logs(changed_at);
CREATE INDEX idx_cv_audit_logs_changed_by ON public.cv_data_audit_logs(changed_by);

-- Enable RLS
ALTER TABLE public.cv_data_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit logs
CREATE POLICY "Admins and managers can view all audit logs"
ON public.cv_data_audit_logs
FOR SELECT
USING (is_admin_or_manager());

CREATE POLICY "Users can view audit logs for their own profile"
ON public.cv_data_audit_logs  
FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Only system can insert audit logs"
ON public.cv_data_audit_logs
FOR INSERT
WITH CHECK (true); -- Triggers will handle this, no user access needed

-- Generic trigger function for CV data audit logging
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all CV-related tables
CREATE TRIGGER audit_general_information_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.general_information
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_technical_skills_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.technical_skills
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_specialized_skills_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.specialized_skills
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_experiences_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_education_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.education
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_trainings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_achievements_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

CREATE TRIGGER audit_projects_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.audit_cv_data_changes();

-- Helper function to get audit history for a profile
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

-- Helper function to get recent changes across all profiles (admin only)
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