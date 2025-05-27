
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { UniversityFormData, UniversityItem } from '@/hooks/use-university-settings';

interface UniversityEditFormProps {
  item: UniversityItem;
  onSave: (id: string, data: UniversityFormData) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

const UniversityEditForm: React.FC<UniversityEditFormProps> = ({
  item,
  onSave,
  onCancel,
  isUpdating
}) => {
  const editForm = useForm<UniversityFormData>({
    defaultValues: {
      name: item.name,
      type: item.type,
      acronyms: item.acronyms || ''
    }
  });

  const handleSubmit = (data: UniversityFormData) => {
    onSave(item.id, data);
  };

  return (
    <Form {...editForm}>
      <form onSubmit={editForm.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={editForm.control}
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
          
          <FormField
            control={editForm.control}
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
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={editForm.control}
            name="acronyms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acronyms</FormLabel>
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
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UniversityEditForm;
