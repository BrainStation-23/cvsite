-- =============================================
-- RBAC System Implementation
-- =============================================

-- Create enum for permission types
CREATE TYPE permission_type_enum AS ENUM ('read', 'write', 'update', 'delete');

-- =============================================
-- Core RBAC Tables
-- =============================================

-- Modules table (main navigation/feature groups)
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sub-modules table (specific pages/features with table access)
CREATE TABLE public.sub_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    route_path TEXT, -- e.g., '/users', '/reports/analytics'
    table_names TEXT[] DEFAULT '{}', -- Tables this sub-module can access
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(module_id, name)
);

-- Permission types table
CREATE TABLE public.permission_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name permission_type_enum NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom roles table (replaces static roles)
CREATE TABLE public.custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_sbu_bound BOOLEAN DEFAULT false, -- If true, user can only access their SBU data
    is_system_role BOOLEAN DEFAULT false, -- For admin, manager roles
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Role permissions table (defines what each role can do)
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
    permission_type_id UUID NOT NULL REFERENCES public.permission_types(id) ON DELETE CASCADE,
    sbu_restrictions UUID[] DEFAULT '{}', -- If empty, access all SBUs (for non-sbu-bound roles)
    table_restrictions TEXT[] DEFAULT '{}', -- Specific tables within sub-module, empty means all
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role_id, sub_module_id, permission_type_id)
);

-- Update user_roles to reference custom_roles instead of text
ALTER TABLE public.user_roles 
ADD COLUMN custom_role_id UUID REFERENCES public.custom_roles(id),
ADD COLUMN assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN sbu_context UUID REFERENCES public.sbus(id); -- For SBU-bound role assignments

-- =============================================
-- Insert Core Permission Types
-- =============================================

INSERT INTO public.permission_types (name, description) VALUES
('read', 'View/Read access to resources'),
('write', 'Create new resources'),
('update', 'Modify existing resources'),
('delete', 'Remove resources');

-- =============================================
-- Enhanced Security Functions
-- =============================================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
    _user_id UUID,
    _sub_module_path TEXT,
    _permission_type permission_type_enum,
    _table_name TEXT DEFAULT NULL,
    _target_sbu_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_sbu_id UUID;
    role_is_sbu_bound BOOLEAN;
BEGIN
    -- Get user's SBU
    SELECT sbu_id INTO user_sbu_id 
    FROM profiles 
    WHERE id = _user_id;
    
    -- Check if user has the permission through any of their roles
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN custom_roles cr ON ur.custom_role_id = cr.id
        JOIN role_permissions rp ON cr.id = rp.role_id
        JOIN sub_modules sm ON rp.sub_module_id = sm.id
        JOIN permission_types pt ON rp.permission_type_id = pt.id
        WHERE ur.user_id = _user_id
        AND cr.is_active = true
        AND sm.route_path = _sub_module_path
        AND pt.name = _permission_type
        AND (
            -- If table specified, check table access
            _table_name IS NULL 
            OR _table_name = ANY(sm.table_names)
            OR (array_length(rp.table_restrictions, 1) > 0 AND _table_name = ANY(rp.table_restrictions))
            OR (array_length(rp.table_restrictions, 1) = 0 OR rp.table_restrictions IS NULL)
        )
        AND (
            -- SBU access control
            cr.is_sbu_bound = false
            OR _target_sbu_id IS NULL
            OR _target_sbu_id = user_sbu_id
            OR (array_length(rp.sbu_restrictions, 1) > 0 AND _target_sbu_id = ANY(rp.sbu_restrictions))
        )
    );
END;
$$;

-- Function to check module access
CREATE OR REPLACE FUNCTION public.has_module_access(
    _user_id UUID,
    _module_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN custom_roles cr ON ur.custom_role_id = cr.id
        JOIN role_permissions rp ON cr.id = rp.role_id
        JOIN sub_modules sm ON rp.sub_module_id = sm.id
        JOIN modules m ON sm.module_id = m.id
        WHERE ur.user_id = _user_id
        AND cr.is_active = true
        AND m.name = _module_name
        AND m.is_active = true
        AND sm.is_active = true
    );
END;
$$;

-- Function to check table access
CREATE OR REPLACE FUNCTION public.has_table_access(
    _user_id UUID,
    _table_name TEXT,
    _permission_type permission_type_enum DEFAULT 'read',
    _target_sbu_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN custom_roles cr ON ur.custom_role_id = cr.id
        JOIN role_permissions rp ON cr.id = rp.role_id
        JOIN sub_modules sm ON rp.sub_module_id = sm.id
        JOIN permission_types pt ON rp.permission_type_id = pt.id
        WHERE ur.user_id = _user_id
        AND cr.is_active = true
        AND pt.name = _permission_type
        AND _table_name = ANY(sm.table_names)
        AND (
            cr.is_sbu_bound = false
            OR _target_sbu_id IS NULL
            OR _target_sbu_id = (SELECT sbu_id FROM profiles WHERE id = _user_id)
            OR (array_length(rp.sbu_restrictions, 1) > 0 AND _target_sbu_id = ANY(rp.sbu_restrictions))
        )
    );
END;
$$;

-- Function to get user permissions with SBU context
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(
    module_name TEXT,
    sub_module_name TEXT,
    route_path TEXT,
    permission_type permission_type_enum,
    table_names TEXT[],
    is_sbu_bound BOOLEAN,
    allowed_sbus UUID[],
    role_name TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.name as module_name,
        sm.name as sub_module_name,
        sm.route_path,
        pt.name as permission_type,
        sm.table_names,
        cr.is_sbu_bound,
        CASE 
            WHEN cr.is_sbu_bound AND array_length(rp.sbu_restrictions, 1) > 0 THEN rp.sbu_restrictions
            WHEN cr.is_sbu_bound THEN ARRAY[(SELECT sbu_id FROM profiles WHERE id = _user_id)]
            ELSE ARRAY[]::UUID[]
        END as allowed_sbus,
        cr.name as role_name
    FROM user_roles ur
    JOIN custom_roles cr ON ur.custom_role_id = cr.id
    JOIN role_permissions rp ON cr.id = rp.role_id
    JOIN sub_modules sm ON rp.sub_module_id = sm.id
    JOIN modules m ON sm.module_id = m.id
    JOIN permission_types pt ON rp.permission_type_id = pt.id
    WHERE ur.user_id = _user_id
    AND cr.is_active = true
    AND m.is_active = true
    AND sm.is_active = true
    ORDER BY m.display_order, sm.display_order, pt.name;
END;
$$;

-- Enhanced admin/manager check functions
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN custom_roles cr ON ur.custom_role_id = cr.id
        WHERE ur.user_id = auth.uid()
        AND cr.name = 'Super Admin'
        AND cr.is_system_role = true
        AND cr.is_active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_system_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN custom_roles cr ON ur.custom_role_id = cr.id
        WHERE ur.user_id = auth.uid()
        AND cr.name IN ('Super Admin', 'Manager')
        AND cr.is_system_role = true
        AND cr.is_active = true
    );
END;
$$;

-- =============================================
-- RLS Policies for New Tables
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Modules policies
CREATE POLICY "Super admins can manage modules" ON public.modules
FOR ALL TO authenticated
USING (is_system_admin())
WITH CHECK (is_system_admin());

CREATE POLICY "All users can view active modules" ON public.modules
FOR SELECT TO authenticated
USING (is_active = true);

-- Sub-modules policies
CREATE POLICY "Super admins can manage sub-modules" ON public.sub_modules
FOR ALL TO authenticated
USING (is_system_admin())
WITH CHECK (is_system_admin());

CREATE POLICY "All users can view active sub-modules" ON public.sub_modules
FOR SELECT TO authenticated
USING (is_active = true);

-- Permission types policies
CREATE POLICY "Super admins can manage permission types" ON public.permission_types
FOR ALL TO authenticated
USING (is_system_admin())
WITH CHECK (is_system_admin());

CREATE POLICY "All users can view permission types" ON public.permission_types
FOR SELECT TO authenticated
USING (true);

-- Custom roles policies
CREATE POLICY "Super admins can manage all custom roles" ON public.custom_roles
FOR ALL TO authenticated
USING (is_system_admin())
WITH CHECK (is_system_admin());

CREATE POLICY "All users can view active roles" ON public.custom_roles
FOR SELECT TO authenticated
USING (is_active = true);

-- Role permissions policies
CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
FOR ALL TO authenticated
USING (is_system_admin())
WITH CHECK (is_system_admin());

CREATE POLICY "All users can view role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (true);

-- =============================================
-- Initial System Roles and Modules Setup
-- =============================================

-- Create system roles
INSERT INTO public.custom_roles (name, description, is_sbu_bound, is_system_role, is_active) VALUES
('Super Admin', 'Full system access with all permissions', false, true, true),
('Manager', 'Management level access with SBU restrictions', true, true, true),
('Employee', 'Basic employee access to own data', true, true, true);

-- Create core modules
INSERT INTO public.modules (name, description, icon, display_order, is_active) VALUES
('Dashboard', 'Main dashboard and overview', 'dashboard', 1, true),
('User Management', 'User profiles and management', 'users', 2, true),
('Resource Planning', 'Resource allocation and planning', 'calendar', 3, true),
('Reports', 'Analytics and reporting', 'chart-bar', 4, true),
('Administration', 'System administration', 'settings', 5, true);

-- Create sub-modules with table access
INSERT INTO public.sub_modules (module_id, name, description, route_path, table_names, display_order) VALUES
-- Dashboard
((SELECT id FROM modules WHERE name = 'Dashboard'), 'Main Dashboard', 'Overview dashboard', '/dashboard', '{"profiles", "resource_planning"}', 1),

-- User Management  
((SELECT id FROM modules WHERE name = 'User Management'), 'User Profiles', 'View and manage user profiles', '/users', '{"profiles", "general_information", "experiences", "education", "technical_skills", "specialized_skills", "projects", "trainings", "achievements"}', 1),
((SELECT id FROM modules WHERE name = 'User Management'), 'User Roles', 'Manage user roles and permissions', '/users/roles', '{"user_roles", "custom_roles", "role_permissions"}', 2),

-- Resource Planning
((SELECT id FROM modules WHERE name = 'Resource Planning'), 'Resource Calendar', 'Resource planning calendar', '/calendar', '{"resource_planning", "projects_management"}', 1),
((SELECT id FROM modules WHERE name = 'Resource Planning'), 'Project Management', 'Manage projects', '/projects', '{"projects_management"}', 2),

-- Reports
((SELECT id FROM modules WHERE name = 'Reports'), 'Analytics Dashboard', 'System analytics', '/reports/analytics', '{"profiles", "resource_planning", "projects_management"}', 1),
((SELECT id FROM modules WHERE name = 'Reports'), 'User Reports', 'User-specific reports', '/reports/users', '{"profiles", "experiences", "education"}', 2),

-- Administration
((SELECT id FROM modules WHERE name = 'Administration'), 'System Settings', 'System configuration', '/admin/settings', '{"sbus", "resource_types", "expertise_types", "designations"}', 1),
((SELECT id FROM modules WHERE name = 'Administration'), 'Role Management', 'Create and manage custom roles', '/admin/roles', '{"custom_roles", "role_permissions", "modules", "sub_modules"}', 2);

-- =============================================
-- Triggers for Updated Timestamps
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_modules_updated_at BEFORE UPDATE ON public.sub_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON public.custom_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_user_roles_custom_role_id ON public.user_roles(custom_role_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_sub_module_id ON public.role_permissions(sub_module_id);
CREATE INDEX idx_sub_modules_module_id ON public.sub_modules(module_id);
CREATE INDEX idx_sub_modules_route_path ON public.sub_modules(route_path);
CREATE INDEX idx_custom_roles_active ON public.custom_roles(is_active) WHERE is_active = true;
CREATE INDEX idx_modules_active ON public.modules(is_active) WHERE is_active = true;