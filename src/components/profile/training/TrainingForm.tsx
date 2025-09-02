import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Training } from '@/types';
import { formatDateToString, parseStringToDate } from '@/utils/date-helpers';

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
    initialData?.date ? parseStringToDate(initialData.date) : new Date()
  );

  const form = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: initialData?.title || '',
      provider: initialData?.provider || '',
      description: initialData?.description || '',
      date: initialData?.date || formatDateToString(new Date()),
      certificateUrl: initialData?.certificateUrl || '',
      isRenewable: false,
      expiryDate: undefined
    }
  });

  const handleSubmit = async (data: Omit<Training, 'id'>) => {
    data.date = formatDateToString(date || new Date());
    
    const success = await onSave(data);
    if (success) {
      onCancel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Training Title" data-tour="training-title" />
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
              <FormLabel>Provider</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Training Provider" data-tour="training-provider" />
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
                  placeholder="Describe the training"
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Training Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-tour="training-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormItem>
        
        <FormField
          control={form.control}
          name="certificateUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Certificate URL" data-tour="training-certificate" />
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
