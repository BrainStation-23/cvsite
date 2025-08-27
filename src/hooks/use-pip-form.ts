
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMonths, addDays, differenceInDays } from 'date-fns';
import { PIP, PIPFormData } from '@/types/pip';

const pipFormSchema = z.object({
  profile_id: z.string().min(1, 'Employee is required'),
  overall_feedback: z.string().min(10, 'Overall feedback must be at least 10 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  mid_date: z.string().optional(),
  end_date: z.string().min(1, 'End date is required'),
  final_review: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
}).refine((data) => {
  if (data.mid_date && data.start_date && data.end_date) {
    const midDate = new Date(data.mid_date);
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return midDate > startDate && midDate < endDate;
  }
  return true;
}, {
  message: "Mid date must be between start and end dates",
  path: ["mid_date"],
});

type PIPFormValues = z.infer<typeof pipFormSchema>;

interface UsePIPFormOptions {
  initialData?: PIP | null;
  onSubmit: (data: PIPFormData) => void;
}

export function usePIPForm({ initialData, onSubmit }: UsePIPFormOptions) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    initialData?.profile_id || null
  );
  const [hasSetMidDate, setHasSetMidDate] = useState(false);
  const [hasSetEndDate, setHasSetEndDate] = useState(false);

  const form = useForm<PIPFormValues>({
    resolver: zodResolver(pipFormSchema),
    defaultValues: {
      profile_id: initialData?.profile_id || '',
      overall_feedback: initialData?.overall_feedback || '',
      start_date: initialData?.start_date || '',
      mid_date: initialData?.mid_date || '',
      end_date: initialData?.end_date || '',
      final_review: initialData?.final_review || '',
    }
  });

  const { setValue, watch, reset } = form;
  const watchedStartDate = watch('start_date');
  const watchedMidDate = watch('mid_date');
  const watchedEndDate = watch('end_date');
  const watchedOverallFeedback = watch('overall_feedback');
  const watchedFinalReview = watch('final_review');

  // Update profile_id when selectedProfileId changes
  useEffect(() => {
    if (selectedProfileId) {
      setValue('profile_id', selectedProfileId);
    } else {
      setValue('profile_id', '');
    }
  }, [selectedProfileId, setValue]);

  // Auto-set dates when start date changes (only if mid/end dates haven't been manually set)
  useEffect(() => {
    if (watchedStartDate && !hasSetMidDate && !hasSetEndDate) {
      const startDate = new Date(watchedStartDate);
      
      // Set end date to 1 month from start date
      const endDate = addMonths(startDate, 1);
      setValue('end_date', endDate.toISOString().split('T')[0]);
      
      // Set mid date to the middle of start and end date
      const daysDifference = differenceInDays(endDate, startDate);
      const midDate = addDays(startDate, Math.floor(daysDifference / 2));
      setValue('mid_date', midDate.toISOString().split('T')[0]);
    }
  }, [watchedStartDate, hasSetMidDate, hasSetEndDate, setValue]);

  // Set flags when editing existing PIP with dates
  useEffect(() => {
    if (initialData) {
      setHasSetMidDate(!!initialData.mid_date);
      setHasSetEndDate(!!initialData.end_date);
    }
  }, [initialData]);

  const handleMidDateChange = (date: string) => {
    setValue('mid_date', date);
    if (date) {
      setHasSetMidDate(true);
    }
  };

  const handleEndDateChange = (date: string) => {
    setValue('end_date', date);
    if (date) {
      setHasSetEndDate(true);
    }
  };

  const handleSubmit = (data: PIPFormValues) => {
    const formData: PIPFormData = {
      profile_id: data.profile_id,
      overall_feedback: data.overall_feedback,
      start_date: data.start_date,
      mid_date: data.mid_date || undefined,
      end_date: data.end_date,
      final_review: data.final_review || undefined,
    };
    onSubmit(formData);
  };

  const handleReset = () => {
    reset();
    setSelectedProfileId(null);
    setHasSetMidDate(false);
    setHasSetEndDate(false);
  };

  const getFormCompletionStatus = () => {
    const steps = [
      { 
        name: 'Employee Selected', 
        completed: Boolean(selectedProfileId) 
      },
      { 
        name: 'Dates Set', 
        completed: Boolean(watchedStartDate && watchedEndDate) 
      },
      { 
        name: 'Feedback Added', 
        completed: Boolean(watchedOverallFeedback && watchedOverallFeedback.length >= 10) 
      }
    ];
    const completedSteps = steps.filter(step => step.completed).length;
    return { steps, completedSteps, total: steps.length };
  };

  return {
    form,
    selectedProfileId,
    setSelectedProfileId,
    watchedStartDate,
    watchedMidDate,
    watchedEndDate,
    watchedOverallFeedback,
    watchedFinalReview,
    handleMidDateChange,
    handleEndDateChange,
    handleSubmit,
    handleReset,
    getFormCompletionStatus,
  };
}
