
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { DegreeCombobox } from '@/components/admin/degree/DegreeCombobox';
import { DepartmentCombobox } from '@/components/admin/department/DepartmentCombobox';
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
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(initialData?.endDate);
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
    data.startDate = startDate || new Date();
    data.endDate = isCurrent ? undefined : endDate;
    data.isCurrent = isCurrent;
    
    const success = await onSave(data);
    if (success) {
      onCancel();
    }
  };

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  const handleStartDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setStartDate(date);
    }
  };

  const handleEndDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setEndDate(date);
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-tour="education-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                />
              </PopoverContent>
            </Popover>
          </FormItem>
          
          <FormItem>
            <FormLabel>End Date</FormLabel>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isCurrent}
                    data-tour="education-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate && !isCurrent ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    disabled={(date) => (
                      (startDate ? date < startDate : false) || 
                      date > new Date()
                    )}
                  />
                </PopoverContent>
              </Popover>
              
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
