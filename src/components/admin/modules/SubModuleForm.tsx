import React, { useEffect } from 'react';
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
import { IconPicker } from './IconPicker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileText, Hash } from 'lucide-react';

const subModuleSchema = z.object({
  module_id: z.string().min(1, 'Module ID is required'),
  name: z.string().min(1, 'Sub-module name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  route_path: z.string().optional(),
  table_names: z.array(z.string()).optional(),
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
      icon: subModule?.icon || '',
      route_path: subModule?.route_path || '',
      table_names: subModule?.table_names || [],
      is_active: subModule?.is_active ?? true,
    },
  });

  // Auto-generate route path from name
  const watchedName = form.watch('name');
  useEffect(() => {
    if (watchedName && !subModule?.route_path) {
      const generatedPath = '/' + watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('route_path', generatedPath);
    }
  }, [watchedName, form, subModule]);

  const handleSubmit = (data: SubModuleFormData) => {
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sub-module Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure the basic information and appearance for this navigation item.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Basic Information */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>
                Essential details about this sub-module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., User Profiles, Role Management" {...field} />
                    </FormControl>
                    <FormDescription>
                      What users will see in the navigation menu
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
                        placeholder="What does this section do? Keep it simple..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Internal note for administrators (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Column 2: Appearance & Navigation */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Appearance & Navigation</CardTitle>
              <CardDescription>
                How this item looks and where it leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Icon</FormLabel>
                    <FormControl>
                      <IconPicker
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Visual icon displayed in navigation menu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Navigation Path
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="/user-profiles"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL path where this section can be accessed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">Active Status</FormLabel>
                      <FormDescription className="text-xs">
                        Show this item in navigation menus
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
            </CardContent>
          </Card>

          {/* Column 3: Data Management */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Data Management</CardTitle>
              <CardDescription>
                Configure what data this section manages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="table_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Data Tables</FormLabel>
                    <FormControl>
                      <TableAssignmentSelector
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Which database tables this section can access (affects user permissions)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Permissions Info</p>
                    <p className="mt-1">Selected tables determine what data users can access when they have permissions for this sub-module.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? 'Saving...' : (subModule ? 'Update Sub-module' : 'Create Sub-module')}
          </Button>
        </div>
        </form>
      </Form>
    </div>
  );
};