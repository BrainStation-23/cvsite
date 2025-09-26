-- Create audit log tables for master data tables
-- References audit log table
CREATE TABLE public.references_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Universities audit log table
CREATE TABLE public.universities_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Departments audit log table
CREATE TABLE public.departments_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Degrees audit log table
CREATE TABLE public.degrees_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Designations audit log table
CREATE TABLE public.designations_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HR Contacts audit log table
CREATE TABLE public.hr_contacts_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Note Categories audit log table
CREATE TABLE public.note_categories_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_role TEXT,
  user_designation TEXT,
  user_sbu_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all audit log tables
ALTER TABLE public.references_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degrees_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_contacts_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_categories_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit tables (only admins can view, system can insert)
CREATE POLICY "Only admins can view references audit logs" ON public.references_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert references audit logs" ON public.references_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view universities audit logs" ON public.universities_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert universities audit logs" ON public.universities_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view departments audit logs" ON public.departments_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert departments audit logs" ON public.departments_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view degrees audit logs" ON public.degrees_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert degrees audit logs" ON public.degrees_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view designations audit logs" ON public.designations_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert designations audit logs" ON public.designations_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view hr_contacts audit logs" ON public.hr_contacts_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert hr_contacts audit logs" ON public.hr_contacts_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view note_categories audit logs" ON public.note_categories_audit_logs FOR SELECT USING (is_admin_or_manager());
CREATE POLICY "System can insert note_categories audit logs" ON public.note_categories_audit_logs FOR INSERT WITH CHECK (true);

-- Create reusable function to get user context for audit logs
CREATE OR REPLACE FUNCTION public.get_user_audit_context()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_context JSONB;
  user_role_name TEXT;
  user_designation TEXT;
  user_sbu_name TEXT;
BEGIN
  -- Get user role
  SELECT cr.name INTO user_role_name
  FROM user_roles ur
  LEFT JOIN custom_roles cr ON ur.custom_role_id = cr.id
  WHERE ur.user_id = auth.uid();
  
  -- Get user designation and SBU
  SELECT gi.current_designation, s.name INTO user_designation, user_sbu_name
  FROM profiles p
  LEFT JOIN general_information gi ON p.id = gi.profile_id
  LEFT JOIN sbus s ON p.sbu_id = s.id
  WHERE p.id = auth.uid();
  
  user_context := jsonb_build_object(
    'role', COALESCE(user_role_name, 'unknown'),
    'designation', COALESCE(user_designation, 'unknown'),
    'sbu_name', COALESCE(user_sbu_name, 'unknown')
  );
  
  RETURN user_context;
END;
$$;

-- Create generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_table_name TEXT;
  user_context JSONB;
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Determine audit table name
  audit_table_name := TG_TABLE_NAME || '_audit_logs';
  
  -- Get user context
  user_context := get_user_audit_context();
  
  -- For UPDATE operations, determine changed fields
  IF TG_OP = 'UPDATE' THEN
    FOR field_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = TG_TABLE_NAME 
        AND table_schema = 'public'
        AND column_name NOT IN ('updated_at', 'created_at')
    LOOP
      IF (to_jsonb(OLD) ->> field_name) IS DISTINCT FROM (to_jsonb(NEW) ->> field_name) THEN
        changed_fields := array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;
  
  -- Insert audit record
  IF TG_OP = 'DELETE' THEN
    EXECUTE format('
      INSERT INTO public.%I (
        record_id, operation_type, changed_by, changed_at, 
        old_data, new_data, changed_fields, user_role, user_designation, user_sbu_name
      ) VALUES ($1, $2, $3, now(), $4, NULL, $5, $6, $7, $8)',
      audit_table_name
    ) USING 
      OLD.id, 'DELETE', auth.uid(), to_jsonb(OLD), '{}',
      user_context->>'role', user_context->>'designation', user_context->>'sbu_name';
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    EXECUTE format('
      INSERT INTO public.%I (
        record_id, operation_type, changed_by, changed_at, 
        old_data, new_data, changed_fields, user_role, user_designation, user_sbu_name
      ) VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8, $9)',
      audit_table_name
    ) USING 
      NEW.id, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW), changed_fields,
      user_context->>'role', user_context->>'designation', user_context->>'sbu_name';
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    EXECUTE format('
      INSERT INTO public.%I (
        record_id, operation_type, changed_by, changed_at, 
        old_data, new_data, changed_fields, user_role, user_designation, user_sbu_name
      ) VALUES ($1, $2, $3, now(), NULL, $4, $5, $6, $7, $8)',
      audit_table_name
    ) USING 
      NEW.id, 'INSERT', auth.uid(), to_jsonb(NEW), '{}',
      user_context->>'role', user_context->>'designation', user_context->>'sbu_name';
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers for each table
CREATE TRIGGER references_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.references
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER universities_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER departments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER degrees_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.degrees
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER designations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.designations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER hr_contacts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.hr_contacts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER note_categories_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.note_categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create indexes for better query performance
CREATE INDEX idx_references_audit_logs_record_id ON public.references_audit_logs(record_id);
CREATE INDEX idx_references_audit_logs_changed_at ON public.references_audit_logs(changed_at);
CREATE INDEX idx_references_audit_logs_changed_by ON public.references_audit_logs(changed_by);

CREATE INDEX idx_universities_audit_logs_record_id ON public.universities_audit_logs(record_id);
CREATE INDEX idx_universities_audit_logs_changed_at ON public.universities_audit_logs(changed_at);
CREATE INDEX idx_universities_audit_logs_changed_by ON public.universities_audit_logs(changed_by);

CREATE INDEX idx_departments_audit_logs_record_id ON public.departments_audit_logs(record_id);
CREATE INDEX idx_departments_audit_logs_changed_at ON public.departments_audit_logs(changed_at);
CREATE INDEX idx_departments_audit_logs_changed_by ON public.departments_audit_logs(changed_by);

CREATE INDEX idx_degrees_audit_logs_record_id ON public.degrees_audit_logs(record_id);
CREATE INDEX idx_degrees_audit_logs_changed_at ON public.degrees_audit_logs(changed_at);
CREATE INDEX idx_degrees_audit_logs_changed_by ON public.degrees_audit_logs(changed_by);

CREATE INDEX idx_designations_audit_logs_record_id ON public.designations_audit_logs(record_id);
CREATE INDEX idx_designations_audit_logs_changed_at ON public.designations_audit_logs(changed_at);
CREATE INDEX idx_designations_audit_logs_changed_by ON public.designations_audit_logs(changed_by);

CREATE INDEX idx_hr_contacts_audit_logs_record_id ON public.hr_contacts_audit_logs(record_id);
CREATE INDEX idx_hr_contacts_audit_logs_changed_at ON public.hr_contacts_audit_logs(changed_at);
CREATE INDEX idx_hr_contacts_audit_logs_changed_by ON public.hr_contacts_audit_logs(changed_by);

CREATE INDEX idx_note_categories_audit_logs_record_id ON public.note_categories_audit_logs(record_id);
CREATE INDEX idx_note_categories_audit_logs_changed_at ON public.note_categories_audit_logs(changed_at);
CREATE INDEX idx_note_categories_audit_logs_changed_by ON public.note_categories_audit_logs(changed_by);