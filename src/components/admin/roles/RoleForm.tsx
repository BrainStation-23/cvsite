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
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: CustomRole;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role }) => {
  const navigate = useNavigate();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      is_sbu_bound: role?.is_sbu_bound || false,
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (role) {
        await updateRoleMutation.mutateAsync({ 
          id: role.id, 
          updates: data 
        });
      } else {
        const newRole = await createRoleMutation.mutateAsync({
          name: data.name!,
          description: data.description,
          is_sbu_bound: data.is_sbu_bound,
          created_by: '', // Will be set by the database trigger
          is_active: true,
          is_system_role: false,
        });
        // Navigate to permissions page for new role
        navigate(`/admin/roles/permissions/${newRole.id}`);
        return;
      }
      navigate('/admin/roles');
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
              <FormDescription>
                A unique name for this role (e.g., "Project Manager", "Senior Developer")
              </FormDescription>
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
                  placeholder="Describe the role's purpose and responsibilities"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description to help others understand this role's purpose
              </FormDescription>
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