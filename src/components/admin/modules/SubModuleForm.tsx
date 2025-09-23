import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SubModule } from '@/types';
import { TableAssignmentSelector } from './TableAssignmentSelector';

const subModuleSchema = z.object({
  module_id: z.string().min(1, 'Module ID is required'),
  name: z.string().min(1, 'Sub-module name is required'),
  description: z.string().optional(),
  table_names: z.array(z.string()).optional(),
  display_order: z.number().min(0, 'Display order must be 0 or greater'),
  is_active: z.boolean(),
});

type SubModuleFormData = z.infer<typeof subModuleSchema>;

interface SubModuleFormProps {
  moduleId: string;
  subModule?: SubModule;
  onSubmit: (data: SubModuleFormData) => void;
  loading?: boolean;
}

export const SubModuleForm: React.FC<SubModuleFormProps> = ({ 
  moduleId,
  subModule, 
  onSubmit, 
  loading = false 
}) => {
  const form = useForm<SubModuleFormData>({
    resolver: zodResolver(subModuleSchema),
    defaultValues: {
      module_id: moduleId,
      name: subModule?.name || '',
      description: subModule?.description || '',
      table_names: subModule?.table_names || [],
      display_order: subModule?.display_order || 0,
      is_active: subModule?.is_active ?? true,
    },
  });

  const handleSubmit = (data: SubModuleFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-module Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., User Profiles, Role Management" {...field} />
              </FormControl>
              <FormDescription>
                The display name for this sub-module
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
                  placeholder="Brief description of this sub-module's functionality..."
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional description for administrative purposes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="table_names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Tables</FormLabel>
              <FormControl>
                <TableAssignmentSelector
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Database tables that this sub-module manages (affects permissions)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first in navigation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether this sub-module appears in navigation and permissions
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

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (subModule ? 'Update Sub-module' : 'Create Sub-module')}
          </Button>
        </div>
      </form>
    </Form>
  );
};