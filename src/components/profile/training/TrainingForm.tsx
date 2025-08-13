
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Training } from '@/types';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface TrainingFormProps {
  initialData?: Training;
  isSaving: boolean;
  onSave: (data: Omit<Training, 'id'>) => Promise<boolean>;
  onCancel: () => void;
}

export const TrainingForm: React.FC<TrainingFormProps> = ({
  initialData,
  isSaving,
  onSave,
  onCancel
}) => {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date || new Date()
  );

  const form = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: initialData?.title || '',
      provider: initialData?.provider || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date()
    }
  });

  const handleSubmit = async (data: Omit<Training, 'id'>) => {
    data.date = date || new Date();
    
    const success = await onSave(data);
    if (success) {
      onCancel();
    }
  };

  const handleDateSelect = (selectedDate: Date | Date[] | undefined) => {
    if (selectedDate && !Array.isArray(selectedDate)) {
      setDate(selectedDate);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'Training name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training / Course Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Training name" data-tour="training-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="provider"
          rules={{ required: 'Provider is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Provider</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Training provider" data-tour="training-provider" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Completion Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-tour="training-completion-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(selectedDate) => selectedDate > new Date()}
              />
            </PopoverContent>
          </Popover>
        </FormItem>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <div data-tour="training-description">
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe what you learned and achieved"
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
          <Button type="submit" disabled={isSaving} data-tour="training-save-button">
            {isSaving ? "Saving..." : initialData ? "Save Changes" : "Save Training"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
