
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Training } from '@/types';

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
    initialData?.date ? (typeof initialData.date === 'string' ? new Date(initialData.date) : initialData.date) : new Date()
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    initialData?.expiryDate ? (typeof initialData.expiryDate === 'string' ? new Date(initialData.expiryDate) : initialData.expiryDate) : undefined
  );
  const [isRenewable, setIsRenewable] = useState(initialData?.isRenewable || false);

  const form = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: initialData?.title || '',
      provider: initialData?.provider || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      certificateUrl: initialData?.certificateUrl || '',
      isRenewable: initialData?.isRenewable || false,
      expiryDate: initialData?.expiryDate || undefined
    }
  });

  const handleSubmit = async (data: Omit<Training, 'id'>) => {
    data.date = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    data.expiryDate = isRenewable && expiryDate ? expiryDate.toISOString().split('T')[0] : undefined;
    data.isRenewable = isRenewable;
    
    const success = await onSave(data);
    if (success) {
      onCancel();
    }
  };

  const handleRenewableChange = (checked: boolean) => {
    setIsRenewable(checked);
    if (!checked) {
      setExpiryDate(undefined);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'Training title is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter training title" data-tour="training-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="provider"
          rules={{ required: 'Training provider is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Provider</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter training provider" data-tour="training-provider" />
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
                <Textarea 
                  {...field} 
                  placeholder="Describe the training content and what you learned"
                  className="min-h-[100px]"
                  data-tour="training-description"
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
                disabled={(date) => date > new Date()}
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
                <Input {...field} placeholder="https://..." data-tour="training-certificate-url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2" data-tour="training-renewable-checkbox">
            <Checkbox 
              id={`renewable-training-${initialData?.id || 'new'}`}
              checked={isRenewable}
              onCheckedChange={handleRenewableChange}
            />
            <label
              htmlFor={`renewable-training-${initialData?.id || 'new'}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This certification requires renewal
            </label>
          </div>
          
          {isRenewable && (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-tour="training-expiry-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, 'PPP') : <span>Pick expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    disabled={(date) => (
                      (date ? date < new Date() : false)
                    )}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        </div>
        
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
