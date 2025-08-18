import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCVTemplates, CVTemplate } from '@/hooks/use-cv-templates';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CVTemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CVTemplate | null>(null);

  const {
    allTemplates: templates, // Use allTemplates for admin view to show disabled templates
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting
  } = useCVTemplates();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Template name must be at least 2 characters.",
    }),
    html_template: z.string().min(10, {
      message: "Template content must be at least 10 characters.",
    }),
    enabled: z.boolean().default(true),
    is_default: z.boolean().default(false),
  })

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      html_template: '',
      enabled: true,
      is_default: false,
    },
    mode: "onChange",
  })

  const handleCreate = (values: FormValues) => {
    createTemplate(values);
    setIsFormOpen(false);
    form.reset();
  };

  const handleUpdate = (id: string, values: FormValues) => {
    updateTemplate({ id, ...values });
    setSelectedTemplate(null);
    setIsFormOpen(false);
    form.reset();
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleOpenForm = (template?: CVTemplate) => {
    setSelectedTemplate(template || null);
    if (template) {
      form.setValue("name", template.name);
      form.setValue("html_template", template.html_template);
      form.setValue("enabled", template.enabled);
      form.setValue("is_default", template.is_default);
    } else {
      form.reset();
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
    form.reset();
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">CV Templates</h1>
        <Button onClick={() => handleOpenForm()}>Create Template</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates List</CardTitle>
          <CardDescription>Manage your CV templates here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" /> Loading templates...
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No templates found.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.enabled ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{template.is_default ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenForm(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setIsDeleteDialogOpen(true);
                          setTemplateToDelete(template);
                        }}
                        className="ml-2"
                        disabled={template.is_default}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? 'Update the template details.' : 'Create a new CV template.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(selectedTemplate ? (values) => handleUpdate(selectedTemplate.id, values) : handleCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Template Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="html_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Template</FormLabel>
                    <FormControl>
                      <Textarea placeholder="HTML Template" className="min-h-[300px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Enabled</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={selectedTemplate?.is_default}
                        />
                      </FormControl>
                      <FormLabel>Default</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {selectedTemplate ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedTemplate ? 'Update Template' : 'Create Template'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (templateToDelete) {
                  handleDelete(templateToDelete.id);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CVTemplatesPage;
