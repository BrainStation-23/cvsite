
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { DegreeFormData } from '@/utils/degreeCsvUtils';

const formSchema = z.object({
  name: z.string().min(1, 'Degree name is required'),
  full_form: z.string().optional(),
});

interface DegreeAddFormProps {
  onSubmit: (data: DegreeFormData) => void;
  isLoading: boolean;
}

const DegreeAddForm: React.FC<DegreeAddFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<DegreeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      full_form: '',
    },
  });

  const handleSubmit = (data: DegreeFormData) => {
    onSubmit({
      name: data.name,
      full_form: data.full_form || undefined
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 items-end">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Degree Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bachelor of Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="full_form"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Full Form (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Adding..." : "Add Degree"}
        </Button>
      </form>
    </Form>
  );
};

export default DegreeAddForm;
