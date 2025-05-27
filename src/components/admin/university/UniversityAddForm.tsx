
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { UniversityFormData } from '@/hooks/use-university-settings';

interface UniversityAddFormProps {
  onSave: (data: UniversityFormData) => void;
  onCancel: () => void;
  isAdding: boolean;
}

const UniversityAddForm: React.FC<UniversityAddFormProps> = ({
  onSave,
  onCancel,
  isAdding
}) => {
  const addForm = useForm<UniversityFormData>({
    defaultValues: {
      name: '',
      type: 'public',
      acronyms: ''
    }
  });

  const handleSubmit = (data: UniversityFormData) => {
    onSave(data);
    addForm.reset();
  };

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Add New University</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...addForm}>
        <form onSubmit={addForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={addForm.control}
            name="name"
            rules={{ required: 'University name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>University Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter university name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={addForm.control}
              name="type"
              rules={{ required: 'Type is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={addForm.control}
              name="acronyms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acronyms (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. MIT, UCLA" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add University"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UniversityAddForm;
