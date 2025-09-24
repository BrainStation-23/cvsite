# Role-Based Access Control (RBAC) Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to transform the current static role-based system into a flexible, scalable Role-Based Access Control (RBAC) system. The new system will enable dynamic role creation, granular permission management, and module-based access control.

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Phase 1: Database Architecture](#phase-1-database-architecture)
3. [Phase 2: Backend Security Layer](#phase-2-backend-security-layer)
4. [Phase 3: Frontend Architecture](#phase-3-frontend-architecture)
5. [Phase 4: Migration Strategy](#phase-4-migration-strategy)
6. [Phase 5: Administration Interface](#phase-5-administration-interface)
7. [Implementation Timeline](#implementation-timeline)
8. [Success Metrics](#success-metrics)

---

## Current System Analysis

### Existing Implementation
- **Static Roles**: Three hardcoded roles using enum ('admin', 'manager', 'employee')
- **Route Protection**: Array-based permission checking with `allowedRoles`
- **Navigation**: Single-role based dynamic menu generation
- **RLS Policies**: Simple boolean checks using `has_role()` functions
- **Module Organization**: Manual grouping without database backing

### Limitations
- No flexibility to create custom roles
- Cannot assign granular permissions
- Difficult to scale with new features
- No audit trail for permission changes
- Limited permission delegation capabilities

---

## Phase 1: Database Architecture

### 1.1 Core Schema Design

#### Modules Table
```sql
-- Top-level functional areas of the application
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Sub-Modules Table
```sql
-- Specific features within modules
CREATE TABLE sub_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  route_pattern text NOT NULL, -- e.g., '/cv-database/*'
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, name)
);
```

#### Permission Types Table
```sql
-- Available permission actions
CREATE TABLE permission_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);
```

#### Custom Roles Table
```sql
-- Flexible role definitions
CREATE TABLE custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Role Permissions Table
```sql
-- Junction table for role-permission assignments
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES custom_roles(id) ON DELETE CASCADE,
  sub_module_id uuid REFERENCES sub_modules(id) ON DELETE CASCADE,
  permission_type_id uuid REFERENCES permission_types(id) ON DELETE CASCADE,
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, sub_module_id, permission_type_id)
);
```

### 1.2 Initial Data Seeding

#### Default Modules
| Module Name | Description | Icon | Priority |
|------------|-------------|------|----------|
| Dashboard | Main overview and analytics | Home | 1 |
| Profile | User profile management | User | 2 |
| CV Database | Employee CV management | Database | 3 |
| Resource Calendar | Resource scheduling | Calendar | 4 |
| Non-Billed Management | Non-billable tracking | BarChart3 | 5 |
| PIP | Performance improvement | AlertTriangle | 6 |
| Administration | System administration | Settings | 7 |
| Audit | System monitoring | Shield | 8 |

#### Standard Permission Types
- **create**: Create new records
- **read**: View/read records
- **update**: Edit existing records
- **delete**: Delete records
- **export**: Export data
- **import**: Import data
- **admin**: Administrative access

---

## Phase 2: Backend Security Layer

### 2.1 Core Security Functions

#### Permission Checking Function
```sql
CREATE OR REPLACE FUNCTION has_permission(
  _user_id uuid, 
  _sub_module_route text, 
  _permission_type text
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN custom_roles cr ON ur.custom_role_id = cr.id
    JOIN role_permissions rp ON cr.id = rp.role_id
    JOIN sub_modules sm ON rp.sub_module_id = sm.id
    JOIN permission_types pt ON rp.permission_type_id = pt.id
    WHERE ur.user_id = _user_id
      AND sm.route_pattern = _sub_module_route
      AND pt.name = _permission_type
      AND rp.granted = true
      AND cr.is_active = true
      AND sm.is_active = true
  );
$$;
```

#### Module Access Validation
```sql
CREATE OR REPLACE FUNCTION has_module_access(
  _user_id uuid, 
  _module_name text
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN custom_roles cr ON ur.custom_role_id = cr.id
    JOIN role_permissions rp ON cr.id = rp.role_id
    JOIN sub_modules sm ON rp.sub_module_id = sm.id
    JOIN modules m ON sm.module_id = m.id
    WHERE ur.user_id = _user_id
      AND m.name = _module_name
      AND rp.granted = true
      AND cr.is_active = true
      AND m.is_active = true
  );
$$;
```

### 2.2 API Endpoints

#### Role Management Endpoints
- `POST /api/roles` - Create new custom role
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role details
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/permissions` - Assign permissions
- `PUT /api/roles/:id/permissions/bulk` - Bulk permission update

#### User Permission Endpoints
- `GET /api/users/:id/permissions` - Get user permissions
- `POST /api/users/:id/roles` - Assign role to user
- `DELETE /api/users/:id/roles/:roleId` - Remove role from user

---

## Phase 3: Frontend Architecture

### 3.1 TypeScript Type Definitions

```typescript
// src/types/rbac.ts

export interface Module {
  id: string;
  name: string;
  description?: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  sub_modules?: SubModule[];
}

export interface SubModule {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  route_pattern: string;
  sort_order: number;
  is_active: boolean;
  permissions?: Permission[];
}

export interface PermissionType {
  id: string;
  name: string;
  description?: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  permissions?: RolePermission[];
}

export interface RolePermission {
  id: string;
  role_id: string;
  sub_module_id: string;
  permission_type_id: string;
  granted: boolean;
}

export interface UserPermission {
  module_name: string;
  sub_module_name: string;
  route_pattern: string;
  permission_name: string;
  granted: boolean;
}
```

### 3.2 Enhanced Authentication Context

```typescript
// src/contexts/AuthContext.tsx

interface AuthContextType {
  // Core authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permission management
  userPermissions: UserPermission[];
  hasPermission: (route: string, permission: string) => boolean;
  hasModuleAccess: (moduleName: string) => boolean;
  canAccess: (route: string) => boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}
```

### 3.3 Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission = 'read',
  fallback = <Navigate to="/unauthorized" />
}) => {
  const { canAccess } = useAuth();
  const location = useLocation();
  
  if (!canAccess(location.pathname, requiredPermission)) {
    return fallback;
  }
  
  return <>{children}</>;
};
```

---

## Phase 4: Migration Strategy

### 4.1 Pre-Migration Steps

1. **Complete System Backup**
   - Database backup
   - Configuration backup
   - Document current permissions

2. **Create Staging Environment**
   - Deploy new schema to staging
   - Test migration scripts
   - Validate data integrity

### 4.2 Migration Process

#### Step 1: Deploy New Schema
```sql
-- Run schema creation scripts
-- Create indexes for performance
CREATE INDEX idx_role_permissions_lookup 
ON role_permissions(role_id, sub_module_id, permission_type_id);

CREATE INDEX idx_user_roles_user 
ON user_roles(user_id);
```

#### Step 2: Data Migration
```sql
-- Migrate existing roles to custom_roles
INSERT INTO custom_roles (name, description, is_system_role)
SELECT 
  CASE role
    WHEN 'admin' THEN 'Super Admin'
    WHEN 'manager' THEN 'Manager'
    WHEN 'employee' THEN 'Employee'
  END,
  CASE role
    WHEN 'admin' THEN 'Full system access'
    WHEN 'manager' THEN 'Management level access'
    WHEN 'employee' THEN 'Basic employee access'
  END,
  true
FROM (SELECT DISTINCT role FROM user_roles) AS distinct_roles;

-- Update user_roles with new custom_role_id
UPDATE user_roles ur
SET custom_role_id = cr.id
FROM custom_roles cr
WHERE (ur.role = 'admin' AND cr.name = 'Super Admin')
   OR (ur.role = 'manager' AND cr.name = 'Manager')
   OR (ur.role = 'employee' AND cr.name = 'Employee');
```

### 4.3 Rollback Plan

1. **Feature Flags**
   ```typescript
   const USE_RBAC = process.env.REACT_APP_USE_RBAC === 'true';
   ```

2. **Parallel Systems**
   - Keep old role column during transition
   - Maintain backward compatibility
   - Gradual user migration

3. **Monitoring**
   - Track permission check performance
   - Monitor error rates
   - User feedback collection

---

## Phase 5: Administration Interface

### 5.1 Role Management Dashboard

#### Core Features
- **Role List View**
  - Searchable/filterable role list
  - Quick actions (edit, delete, duplicate)
  - Active/inactive status toggle

- **Create/Edit Role Interface**
  - Role details form
  - Permission matrix grid
  - Visual permission editor
  - Template selection

- **Permission Matrix**
  - Module × Permission grid
  - Bulk permission assignment
  - Permission inheritance visualization

### 5.2 Component Structure

```
src/
├── pages/
│   └── admin/
│       ├── RoleManagement.tsx
│       ├── CreateRole.tsx
│       └── EditRole.tsx
├── components/
│   └── rbac/
│       ├── PermissionMatrix.tsx
│       ├── ModulePermissionEditor.tsx
│       ├── RoleSelector.tsx
│       ├── UserRoleAssignment.tsx
│       └── PermissionAuditLog.tsx
```

---

## Implementation Timeline

### Overall Timeline: 11-15 Weeks

| Phase | Duration | Tasks | Dependencies |
|-------|----------|-------|--------------|
| **Phase 1** | 1-2 weeks | Database schema design and creation | None |
| **Phase 2** | 2-3 weeks | Backend functions, APIs, and security layer | Phase 1 |
| **Phase 3** | 1-2 weeks | Frontend types and auth context | Phase 2 |
| **Phase 4** | 2-3 weeks | Data migration and testing | Phases 1-3 |
| **Phase 5** | 3-4 weeks | Admin UI and role management | Phases 1-4 |
| **Testing** | 1-2 weeks | End-to-end testing and optimization | All phases |
| **Deployment** | 1 week | Production deployment and monitoring | Testing complete |

### Milestones

- **Week 2**: Database schema deployed to staging
- **Week 5**: Backend APIs functional
- **Week 7**: Frontend integration complete
- **Week 10**: Migration tested successfully
- **Week 14**: Admin interface operational
- **Week 15**: Production deployment

---

## Success Metrics

### Technical Metrics
- **Performance**: Permission checks < 50ms
- **Scalability**: Support 100+ custom roles
- **Reliability**: 99.9% uptime for auth services
- **Security**: Zero permission escalation incidents

### Business Metrics
- **Flexibility**: 80% reduction in role change requests
- **Efficiency**: 60% faster onboarding for new employees
- **Compliance**: 100% audit trail coverage
- **User Satisfaction**: > 4.5/5 admin user rating

### Monitoring Dashboard
- Real-time permission check performance
- Role usage analytics
- Permission change audit log
- System health indicators

---

## Risk Mitigation

### Identified Risks

1. **Data Migration Failures**
   - Mitigation: Comprehensive backup and rollback procedures
   
2. **Performance Degradation**
   - Mitigation: Indexing strategy and caching layer
   
3. **User Adoption Issues**
   - Mitigation: Training materials and gradual rollout
   
4. **Security Vulnerabilities**
   - Mitigation: Security audit and penetration testing

---

## Conclusion

This RBAC implementation will transform the current rigid role system into a flexible, scalable, and maintainable permission management solution. The phased approach ensures minimal disruption while delivering incremental value throughout the implementation process.

## Next Steps

1. Review and approve implementation plan
2. Allocate development resources
3. Set up staging environment
4. Begin Phase 1 implementation
5. Schedule regular progress reviews

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Status: Draft - Pending Approval*