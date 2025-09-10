
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProjectBillTypeCombobox from '@/components/resource-planning/ProjectBillTypeCombobox';
import { ProjectTypeCombobox } from '@/components/projects/ProjectTypeCombobox';

const projectSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  client_name: z.string().optional(),
  project_manager: z.string().optional(),
  budget: z.coerce.number().optional(),
  description: z.string().optional(),
  project_level: z.string().optional(),
  project_bill_type: z.string().optional(),
  project_type: z.string().optional(),
  is_active: z.boolean().default(true),
  forecasted: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  description?: string | null;
  project_level?: string | null;
  project_bill_type?: string | null;
  project_type?: string | null;
  is_active: boolean;
  forecasted: boolean;
}

interface ProjectFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  initialData?: Project | null;
  title: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}) => {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: '',
      client_name: '',
      project_manager: '',
      budget: undefined,
      description: '',
      project_level: '',
      project_bill_type: '',
      project_type: '',
      is_active: true,
      forecasted: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        project_name: initialData.project_name || '',
        client_name: initialData.client_name || '',
        project_manager: initialData.project_manager || '',
        budget: initialData.budget || undefined,
        description: initialData.description || '',
        project_level: initialData.project_level || '',
        project_bill_type: initialData.project_bill_type || '',
        project_type: initialData.project_type || '',
        is_active: initialData.is_active,
        forecasted: initialData.forecasted,
      });
    } else {
      form.reset({
        project_name: '',
        client_name: '',
        project_manager: '',
        budget: undefined,
        description: '',
        project_level: '',
        project_bill_type: '',
        project_type: '',
        is_active: true,
        forecasted: false,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    const success = await onSubmit({
      project_name: data.project_name,
      client_name: data.client_name || null,
      project_manager: data.project_manager || null,
      budget: data.budget || null,
      description: data.description || null,
      project_level: data.project_level || null,
      project_bill_type: data.project_bill_type || null,
      project_type: data.project_type || null,
      is_active: data.is_active,
      forecasted: data.forecasted,
    });

    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  const projectLevels = [
    { value: 'export', label: 'Export' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
    { value: 'investment', label: 'Investment' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No level specified</SelectItem>
                        {projectLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_bill_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Bill Type</FormLabel>
                    <FormControl>
                      <ProjectBillTypeCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select project bill type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <FormControl>
                      <ProjectTypeCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select project type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter budget amount" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter project description"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
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
                    <FormLabel className="text-base">Active Project</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this project for resource planning and assignments
                    </div>
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
              name="forecasted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Forecasted Project</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this project for forecasted resource planning and assignments
                    </div>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
