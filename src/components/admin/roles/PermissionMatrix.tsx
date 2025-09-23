import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ModulePermissionCard } from './ModulePermissionCard';
import { useModulesWithSubModules } from '@/hooks/rbac/useModules';
import { useRolePermissions, useUpdateRolePermissions, usePermissionTypes } from '@/hooks/rbac/usePermissions';
import { CustomRole, RolePermission } from '@/types';

interface PermissionMatrixProps {
  roleId: string;
  role: CustomRole;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ roleId, role }) => {
  const { data: modules, isLoading: modulesLoading } = useModulesWithSubModules();
  const { data: rolePermissions, isLoading: permissionsLoading } = useRolePermissions(roleId);
  const { data: permissionTypes, isLoading: typesLoading } = usePermissionTypes();
  const updatePermissionsMutation = useUpdateRolePermissions();
  
  const [permissions, setPermissions] = useState<Omit<RolePermission, 'id' | 'created_at' | 'updated_at' | 'role_id'>[]>([]);

  useEffect(() => {
    if (rolePermissions) {
      setPermissions(
        rolePermissions.map(rp => ({
          module_id: rp.module_id,
          sub_module_id: rp.sub_module_id,
          permission_type_id: rp.permission_type_id,
          sbu_restrictions: rp.sbu_restrictions,
        }))
      );
    }
  }, [rolePermissions]);

  const handlePermissionChange = (
    moduleId: string,
    subModuleId: string | undefined,
    permissionTypeId: string,
    granted: boolean,
    sbuRestrictions?: string[]
  ) => {
    setPermissions(prev => {
      if (granted) {
        // Add permission if not exists
        const exists = prev.some(
          p => p.module_id === moduleId && 
               p.sub_module_id === subModuleId && 
               p.permission_type_id === permissionTypeId
        );
        
        if (!exists) {
          return [...prev, {
            module_id: moduleId,
            sub_module_id: subModuleId,
            permission_type_id: permissionTypeId,
            sbu_restrictions: sbuRestrictions,
          }];
        } else {
          // Update existing permission with new SBU restrictions
          return prev.map(p => 
            p.module_id === moduleId && 
            p.sub_module_id === subModuleId && 
            p.permission_type_id === permissionTypeId
              ? { ...p, sbu_restrictions: sbuRestrictions }
              : p
          );
        }
      } else {
        // Remove permission
        return prev.filter(
          p => !(p.module_id === moduleId && 
                 p.sub_module_id === subModuleId && 
                 p.permission_type_id === permissionTypeId)
        );
      }
    });
  };

  const handleSave = async () => {
    await updatePermissionsMutation.mutateAsync({
      roleId,
      permissions,
    });
  };

  const isLoading = modulesLoading || permissionsLoading || typesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!modules || !permissionTypes) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No modules or permission types found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((module) => (
        <ModulePermissionCard
          key={module.id}
          module={module}
          permissionTypes={permissionTypes}
          permissions={permissions}
          onPermissionChange={handlePermissionChange}
          isSBUBound={role.is_sbu_bound}
        />
      ))}
      
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleSave}
          disabled={updatePermissionsMutation.isPending}
        >
          {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </div>
  );
};