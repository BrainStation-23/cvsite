import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomRole } from '@/types';
import { useCreateRole, useUpdateRole } from '@/hooks/rbac/useRoles';
import { useNavigate } from 'react-router-dom';

const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  is_sbu_bound: z.boolean().default(false),
  is_self_bound: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: CustomRole;
  onSuccess?: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSuccess }) => {
  const navigate = useNavigate();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_sbu_bound: false,
      is_self_bound: false,
    },
  });

  // Reset form when role changes
  React.useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description || '',
        is_sbu_bound: role.is_sbu_bound,
        is_self_bound: role.is_self_bound,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        is_sbu_bound: false,
        is_self_bound: false,
      });
    }
  }, [role, form]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (role) {
        await updateRoleMutation.mutateAsync({ 
          id: role.id, 
          updates: data 
        }, {
          onSuccess: () => {
            if (onSuccess) onSuccess();
          },
        });
      } else {
        const newRole = await createRoleMutation.mutateAsync({
          name: data.name!,
          description: data.description,
          is_sbu_bound: data.is_sbu_bound,
          is_self_bound: data.is_self_bound,
          created_by: '', // Will be set by the database trigger
          is_active: true,
          is_system_role: false,
        }, {
          onSuccess: () => {
            if (onSuccess) onSuccess();
          },
        });
        // Navigate to permissions page for new role
        navigate(`/admin/roles/permissions/${newRole.id}`);
        return;
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter role description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_sbu_bound"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">SBU Bound Role</FormLabel>
                <FormDescription>
                  When enabled, this role's permissions can be restricted to specific Strategic Business Units (SBUs).
                  Users with this role will only see data from their assigned SBUs.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_self_bound"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Self Bound Role</FormLabel>
                <FormDescription>
                  When enabled, users with this role will only have access to their own data.
                  This is useful for roles that should only see and manage their own information.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/roles')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
          >
            {createRoleMutation.isPending || updateRoleMutation.isPending 
              ? 'Saving...' 
              : role ? 'Update Role' : 'Create Role'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};