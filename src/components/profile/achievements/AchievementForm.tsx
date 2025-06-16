
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Achievement } from '@/types';

interface AchievementFormProps {
  form: UseFormReturn<Omit<Achievement, 'id'>>;
  onSubmit: (data: Omit<Achievement, 'id'>) => Promise<void>;
  onCancel: () => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isSaving: boolean;
  title: string;
  submitButtonText: string;
}

export const AchievementForm: React.FC<AchievementFormProps> = ({
  form,
  onSubmit,
  onCancel,
  date,
  setDate,
  isSaving,
  title,
  submitButtonText
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Achievement Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Employee of the Month" data-tour="achievement-title" />
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
                  data-tour="achievement-date"
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
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe your achievement and its significance" 
                    rows={4}
                    data-tour="achievement-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} data-tour="achievement-save-button">
              {isSaving ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
