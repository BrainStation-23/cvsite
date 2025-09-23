import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleService } from '@/services/rbac/roleService';
import { CustomRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: RoleService.getAllRoles,
  });
};

export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: () => RoleService.getRoleById(roleId),
    enabled: !!roleId,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (roleData: Omit<CustomRole, 'id' | 'created_at' | 'updated_at'>) =>
      RoleService.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustomRole> }) =>
      RoleService.updateRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: RoleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive',
      });
    },
  });
};