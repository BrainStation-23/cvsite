
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { DegreeCombobox } from '@/components/admin/degree/DegreeCombobox';
import { DepartmentCombobox } from '@/components/admin/department/DepartmentCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { Education } from '@/types';

interface EducationFormProps {
  initialData?: Education;
  isSaving: boolean;
  onSave: (data: Omit<Education, 'id'>) => Promise<boolean>;
  onCancel: () => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  initialData,
  isSaving,
  onSave,
  onCancel
}) => {
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
  );
  const [isCurrent, setIsCurrent] = useState(initialData?.isCurrent || false);

  const form = useForm<Omit<Education, 'id'>>({
    defaultValues: {
      university: initialData?.university || '',
      degree: initialData?.degree || '',
      department: initialData?.department || '',
      gpa: initialData?.gpa || '',
      startDate: initialData?.startDate || new Date(),
      isCurrent: initialData?.isCurrent || false
    }
  });

  const handleSubmit = async (data: Omit<Education, 'id'>) => {
    data.startDate = startDate ? new Date(startDate) : new Date();
    data.endDate = isCurrent ? undefined : (endDate ? new Date(endDate) : undefined);
    data.isCurrent = isCurrent;
    
    const success = await onSave(data);
    if (success) {
      onCancel();
    }
  };

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="university"
          rules={{ required: 'University is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>University / Institution</FormLabel>
              <FormControl>
                <div data-tour="education-university">
                  <UniversityCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select university"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="degree"
            rules={{ required: 'Degree is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <div data-tour="education-degree">
                    <DegreeCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select degree"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <div data-tour="education-department">
                    <DepartmentCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select department"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <div data-tour="education-start-date">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
          </FormItem>
          
          <FormItem>
            <FormLabel>End Date</FormLabel>
            <div className="space-y-2">
              <div data-tour="education-end-date">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select end date"
                  disabled={isCurrent}
                />
              </div>
              
              <div className="flex items-center space-x-2" data-tour="education-current-checkbox">
                <Checkbox 
                  id={`current-education-${initialData?.id || 'new'}`}
                  checked={isCurrent}
                  onCheckedChange={handleCurrentCheckboxChange}
                />
                <label
                  htmlFor={`current-education-${initialData?.id || 'new'}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Currently Studying
                </label>
              </div>
            </div>
          </FormItem>
        </div>
        
        <FormField
          control={form.control}
          name="gpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPA / Grade (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 3.8/4.0" data-tour="education-gpa" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} data-tour="education-save-button">
            {isSaving ? "Saving..." : initialData ? "Save Changes" : "Save Education"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
