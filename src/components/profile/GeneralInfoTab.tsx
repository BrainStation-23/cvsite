
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GeneralInfoFormData {
  firstName: string;
  lastName: string;
  designation: string;
  biography: string;
}

interface GeneralInfoTabProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ form, isEditing }) => {
  const [designations, setDesignations] = useState<string[]>([]);

  // Fetch designations from the database
  const { data: designationsData } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designations')
        .select('name')
        .order('name');
      
      if (error) throw error;
      return data.map(d => d.name);
    },
    enabled: isEditing,
  });

  // Update designations when data is fetched
  useEffect(() => {
    if (designationsData) {
      setDesignations(designationsData);
    }
  }, [designationsData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value}</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value}</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300">
                          <SelectValue placeholder="Select a designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {designations.map((designation) => (
                            <SelectItem key={designation} value={designation}>
                              {designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value || "Not specified"}</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biography</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Textarea
                        {...field}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value || "No biography provided"}</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
