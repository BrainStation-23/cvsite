
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
import { ProjectExperience } from '@/types';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface ProjectFormProps {
  initialData?: ProjectExperience;
  isSaving: boolean;
  onSave: (data: Omit<ProjectExperience, 'id'>) => Promise<boolean>;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
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

  const form = useForm<Omit<ProjectExperience, 'id'>>({
    defaultValues: {
      projectName: initialData?.projectName || '',
      clientName: initialData?.clientName || '',
      role: initialData?.role || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate || new Date(),
      isCurrent: initialData?.isCurrent || false
    }
  });

  const handleSubmit = async (data: Omit<ProjectExperience, 'id'>) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectName"
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
            name="clientName"
            rules={{ required: 'Client name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Client name" data-tour="project-client" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="role"
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role in Project</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your role in this project" data-tour="project-role" />
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
                    onSelect={handleEndDateSelect}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div data-tour="project-description">
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe your role and achievements in this project"
                    className="min-h-[120px]"
                  />
                </div>
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
