import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionService } from '@/services/rbac/permissionService';
import { RolePermission } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useRolePermissions = (roleId: string) => {
  return useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => PermissionService.getRolePermissions(roleId),
    enabled: !!roleId,
  });
};

export const usePermissionTypes = () => {
  return useQuery({
    queryKey: ['permissionTypes'],
    queryFn: PermissionService.getPermissionTypes,
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      roleId, 
      permissions 
    }: { 
      roleId: string; 
      permissions: Omit<RolePermission, 'id' | 'created_at' | 'updated_at'>[] 
    }) => {
      const permissionsWithRoleId = permissions.map(p => ({ 
        ...p, 
        role_id: roleId,
        sub_module_id: p.sub_module_id || '',
        table_restrictions: p.table_restrictions || undefined
      }));
      return PermissionService.updateRolePermissions(roleId, permissionsWithRoleId);
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions', roleId] });
      toast({
        title: 'Success',
        description: 'Role permissions updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update role permissions',
        variant: 'destructive',
      });
    },
  });
};