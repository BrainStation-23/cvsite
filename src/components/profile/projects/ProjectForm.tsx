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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TechnologyCombobox } from '@/components/admin/technology/TechnologyCombobox';
import { Project } from '@/types';
import { formatDateToString, parseStringToDate } from '@/utils/date-helpers';

interface ProjectFormProps {
  initialData?: Project;
  isSaving: boolean;
  onSave: (data: Omit<Project, 'id'>) => Promise<boolean>;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  isSaving,
  onSave,
  onCancel
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? parseStringToDate(initialData.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? parseStringToDate(initialData.endDate) : undefined
  );
  const [isCurrent, setIsCurrent] = useState(initialData?.isCurrent || false);

  const form = useForm<Omit<Project, 'id'>>({
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      description: initialData?.description || '',
      responsibility: initialData?.responsibility || '',
      startDate: initialData?.startDate || formatDateToString(new Date()),
      isCurrent: initialData?.isCurrent || false,
      technologiesUsed: initialData?.technologiesUsed || [],
      url: initialData?.url || ''
    }
  });

  const handleSubmit = async (data: Omit<Project, 'id'>) => {
    data.startDate = formatDateToString(startDate || new Date());
    data.endDate = isCurrent ? undefined : formatDateToString(endDate);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Project name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project name" data-tour="project-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Role</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your role in the project" data-tour="project-role" />
              </FormControl>
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
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Describe the project and your contributions"
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsibilities</FormLabel>
              <FormControl>
                <Input {...field} placeholder="List your responsibilities" data-tour="project-responsibilities" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-tour="project-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
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
                    data-tour="project-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate && !isCurrent ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => (
                      (startDate ? date < startDate : false) || 
                      date > new Date()
                    )}
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center space-x-2" data-tour="project-current-checkbox">
                <Checkbox 
                  id={`current-project-${initialData?.id || 'new'}`}
                  checked={isCurrent}
                  onCheckedChange={handleCurrentCheckboxChange}
                />
                <label
                  htmlFor={`current-project-${initialData?.id || 'new'}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Currently Working
                </label>
              </div>
            </div>
          </FormItem>
        </div>
        
        <FormField
          control={form.control}
          name="technologiesUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies Used</FormLabel>
              <FormControl>
                <div data-tour="project-technologies">
                  <TechnologyCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select technologies"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Link to the project" data-tour="project-url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} data-tour="project-save-button">
            {isSaving ? "Saving..." : initialData ? "Save Changes" : "Save Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
