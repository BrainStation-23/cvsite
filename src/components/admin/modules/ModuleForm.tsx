import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Module } from '@/types';

const moduleSchema = z.object({
  name: z.string().min(1, 'Module name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.number().min(0, 'Display order must be 0 or greater'),
  is_active: z.boolean(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
  module?: Module;
  onSubmit: (data: ModuleFormData) => void;
  loading?: boolean;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({ 
  module, 
  onSubmit, 
  loading = false 
}) => {
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: module?.name || '',
      description: module?.description || '',
      icon: module?.icon || '',
      display_order: module?.display_order || 0,
      is_active: module?.is_active ?? true,
    },
  });

  const handleSubmit = (data: ModuleFormData) => {
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
              <FormLabel>Module Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., User Management" {...field} />
              </FormControl>
              <FormDescription>
                The display name for this module in the navigation
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
                  placeholder="Brief description of what this module contains..."
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
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Users, Settings, Database" {...field} />
              </FormControl>
              <FormDescription>
                Lucide icon name for the navigation (optional)
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
                  Whether this module appears in navigation and permissions
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
            {loading ? 'Saving...' : (module ? 'Update Module' : 'Create Module')}
          </Button>
        </div>
      </form>
    </Form>
  );
};