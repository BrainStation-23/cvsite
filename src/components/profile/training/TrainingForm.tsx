
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Training } from '@/types';

interface TrainingFormProps {
  initialData?: Omit<Training, 'id'>;
  onSubmit: (data: Omit<Training, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isNew?: boolean;
}

export const TrainingForm: React.FC<TrainingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
  date,
  setDate,
  isNew = false
}) => {
  const form = useForm<Omit<Training, 'id'>>({
    defaultValues: initialData || {
      title: '',
      provider: '',
      description: '',
      date: new Date(),
      certificateUrl: ''
    }
  });

  const handleSubmit = async (data: Omit<Training, 'id'>) => {
    data.date = date || new Date();
    await onSubmit(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">
          {isNew ? 'Add New Training/Certification' : 'Edit Training'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. AWS Certified Solutions Architect" data-tour="training-title" />
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
                  <Input {...field} placeholder="e.g. Amazon Web Services" data-tour="training-provider" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Date</FormLabel>
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Brief description of the certification or training" 
                    rows={3}
                    data-tour="training-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="certificateUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate URL (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." type="url" data-tour="training-certificate-url" />
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
              {isSaving ? "Saving..." : isNew ? "Save Training" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
