Here’s your documentation rewritten in clean **Markdown** format, with clear hierarchy and code blocks preserved:

````markdown
# Developer Documentation: Implementing Granular RBAC Features in Frontend

## Overview
This guide provides step-by-step instructions for implementing permission-based UI elements in the **Resource Planning module** and other frontend components using our existing RBAC system.

---

## Current System Analysis

### Existing RBAC Infrastructure
- ✅ AuthContext with permission checking functions  
- ✅ Permission types: `create`, `read`, `update`, `delete`, `manage`  
- ✅ Module and sub-module based permissions  
- ✅ SBU-bound permission support  
- ✅ Real-time permission checking via RPC functions  

### Current Permission Check Functions

```ts
// Available in useAuth()
hasModuleAccess(moduleId: string): boolean
hasSubModulePermission(
  subModuleId: string, 
  permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage'
): boolean
hasSubModulePermissionRealTime(
  subModuleId: string, 
  permissionType: string, 
  targetSbuId?: string
): Promise<boolean>
````

---

## Step 1: Create Permission Utility Hooks

**Missing Component:** We need reusable permission hooks for UI elements.

**File:** `src/hooks/use-permission-ui.ts`

```ts
import { useAuth } from '@/contexts/AuthContext';

export interface PermissionConfig {
  moduleId: string;
  subModuleId: string;
  permissions: Array<'create' | 'read' | 'update' | 'delete'>;
}

export const usePermissionUI = (config: PermissionConfig) => {
  const { hasSubModulePermission } = useAuth();
  
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    return hasSubModulePermission(config.subModuleId, permission);
  };

  return {
    // Read permissions
    canRead: hasPermission('read'),
    
    // Create permissions
    canCreate: hasPermission('create'),
    showCreateButton: hasPermission('create'),
    showDuplicateButton: hasPermission('create'),
    
    // Update permissions  
    canUpdate: hasPermission('update'),
    showEditButton: hasPermission('update'),
    showCompleteButton: hasPermission('update'),
    showInvalidateButton: hasPermission('update'),
    showBulkUpdateButton: hasPermission('update'),
    
    // Delete permissions
    canDelete: hasPermission('delete'),
    showDeleteButton: hasPermission('delete'),
    
    // Combined permissions
    hasAnyPermission: config.permissions.some(p => hasPermission(p)),
    hasAllPermissions: config.permissions.every(p => hasPermission(p)),
    
    // Specific permission checker
    hasPermission,
  };
};
```

---

## Step 2: Create Permission-Based Action Button Component

**File:** `src/components/ui/permission-button.tsx`

```tsx
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { usePermissionUI, PermissionConfig } from '@/hooks/use-permission-ui';

interface PermissionButtonProps extends ButtonProps {
  permissionConfig: PermissionConfig;
  requiredPermission: 'create' | 'read' | 'update' | 'delete';
  fallbackContent?: React.ReactNode;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissionConfig,
  requiredPermission,
  fallbackContent = null,
  children,
  ...buttonProps
}) => {
  const { hasPermission } = usePermissionUI(permissionConfig);
  
  if (!hasPermission(requiredPermission)) {
    return <>{fallbackContent}</>;
  }
  
  return <Button {...buttonProps}>{children}</Button>;
};
```

---

## Step 3: Create Module-Specific Permission Hook

**File:** `src/hooks/use-resource-planning-permissions.ts`

```ts
import { usePermissionUI } from './use-permission-ui';

export const useResourcePlanningPermissions = () => {
  return usePermissionUI({
    moduleId: 'Resource Calendar',
    subModuleId: 'Planning',
    permissions: ['create', 'read', 'update', 'delete']
  });
};
```

---

## Step 4: Update Resource Planning Components

### 4.1 Update Page Header Actions

**File:** `src/pages/resource-calendar/ResourceCalendarPlanning.tsx`

```tsx
import React from 'react';
import { ResourcePlanningTable } from '../../components/resource-planning/ResourcePlanningTable';
import { ResourcePlanningExportButton } from '../../components/resource-planning/ResourcePlanningExportButton';
import { ResourcePlanningAuditLogsDialog } from '@/components/resource-planning/ResourcePlanningAuditLogsDialog';
import { BulkResourcePlanningUpdate } from '@/components/resource-planning/BulkResourcePlanningUpdate';
import { useResourcePlanningPermissions } from '@/hooks/use-resource-planning-permissions';

const ResourceCalendarPlanning: React.FC = () => {
  const permissions = useResourcePlanningPermissions();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Planning
          </h1>
        </div>
        <div className="flex space-x-2">
          {permissions.showBulkUpdateButton && <BulkResourcePlanningUpdate />}
          {permissions.canRead && <ResourcePlanningExportButton />}
          {permissions.canRead && (
            <ResourcePlanningAuditLogsDialog
              params={{ items_per_page: 100, page_number: 1 }}
            />
          )}
        </div>
      </div>
      <ResourcePlanningTable />
    </div>
  );
};

export default ResourceCalendarPlanning;
```

---

### 4.2 Update Table Row Actions

**File:** `src/components/resource-planning/ResourcePlanningTableRow.tsx`

```tsx
import { useResourcePlanningPermissions } from '@/hooks/use-resource-planning-permissions';

// Inside the component
const permissions = useResourcePlanningPermissions();

<TableCell className="py-1 px-2">
  <div className="flex items-center gap-1">
    {permissions.showEditButton && (
      <Button ...>Edit</Button>
    )}
    {permissions.showCompleteButton && (
      <Button ...>Complete</Button>
    )}
    {permissions.showInvalidateButton && (
      <Button ...>Invalidate</Button>
    )}
    {permissions.showDuplicateButton && (
      <Button ...>Duplicate</Button>
    )}
    {permissions.showDeleteButton && (
      <Button ...>Delete</Button>
    )}
  </div>
</TableCell>
```

---

### 4.3 Update Bulk Actions Toolbar

**File:** `src/components/resource-planning/BulkActionsToolbar.tsx`

```tsx
import { useResourcePlanningPermissions } from '@/hooks/use-resource-planning-permissions';

const permissions = useResourcePlanningPermissions();

{permissions.canRead && <ResourcePlanningExportButton selectedItems={selectedItems} />}
{permissions.showCompleteButton && <Button ...>Complete</Button>}
{permissions.showDuplicateButton && <Button ...>Copy</Button>}
{showValidate && permissions.canUpdate && <Button ...>Validate</Button>}
{showInvalidate && permissions.canUpdate && <Button ...>Invalidate</Button>}
{permissions.showDeleteButton && <Button ...>Delete</Button>}
<Button ...>Clear</Button>
```

---

### 4.4 Update Resource Planning Table

**File:** `src/components/resource-planning/ResourcePlanningTable.tsx`

```tsx
import { useResourcePlanningPermissions } from '@/hooks/use-resource-planning-permissions';

const permissions = useResourcePlanningPermissions();

const handleCreatePlan = (profileId?: string) => {
  if (!permissions.canCreate) return;
  setPreselectedProfileId(profileId || null);
  setShowCreateForm(true);
};

{showCreateForm && permissions.canCreate && (
  <Card>
    <CardHeader><CardTitle>Create Resource Assignment</CardTitle></CardHeader>
    <CardContent>
      <CreateResourcePlanningForm onSuccess={handleFormSuccess} />
    </CardContent>
  </Card>
)}
```

---

## Step 5: Testing Checklist

* **Read-Only User**
  ✅ Can see table data
  ❌ No action buttons
  ❌ No bulk actions toolbar
  ❌ No create form
  ✅ Can see export

* **Create Permission**
  ✅ Duplicate button
  ✅ Create form
  ❌ No edit/update

* **Update Permission**
  ✅ Edit, complete, invalidate buttons
  ✅ Bulk update actions
  ✅ Bulk export

* **Delete Permission**
  ✅ Delete button
  ✅ Bulk delete

* **Combined Permissions**
  ✅ Shows allowed buttons
  ❌ Hides others

---

## Step 6: Permission Matrix Configuration

* **Module:** `Resource Calendar`
* **Sub-Module:** `Planning`
* **Permission Types:** `create`, `read`, `update`, `delete`
* Ensure SBU restrictions are configured correctly.

---

## Step 7: Implementation Guidelines for Other Modules

**Replication Pattern:**

1. Create module-specific hook using `usePermissionUI`
2. Add permission checks to page headers
3. Add conditional rendering to row actions
4. Update bulk actions
5. Restrict form access
6. Test with different permission combinations

**Example – PIP Module**

```ts
// hooks/use-pip-permissions.ts
export const usePIPPermissions = () => {
  return usePermissionUI({
    moduleId: 'PIP',
    subModuleId: 'PIP Management',
    permissions: ['create', 'read', 'update', 'delete']
  });
};
```

---

## Missing Components That Need Creation

* ✅ `usePermissionUI` hook
* ✅ `PermissionButton` component
* ✅ Module-specific permission hooks
* ✅ Existing components already support integration

---

## Security Considerations

* Frontend checks = **UX only**
* Backend RLS = **actual security**
* Use `hasSubModulePermissionRealTime` for critical ops
* Enforce SBU restrictions at **data level**

---

## Implementation Plan for Frontend RBAC Granular Permissions

1. **Core Permission Utilities**

   * `use-permission-ui.ts`
   * `permission-button.tsx`
   * `use-resource-planning-permissions.ts`

2. **Update Resource Planning Components**

   * `ResourceCalendarPlanning.tsx`
   * `ResourcePlanningTableRow.tsx`
   * `BulkActionsToolbar.tsx`
   * `ResourcePlanningTable.tsx`

3. **Testing & Validation**

   * Verify all permission scenarios
   * Confirm SBU restrictions
   * Check fallbacks

---
