
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import DatePicker from '@/components/admin/user/DatePicker';
import { useEnhancedProfileDetails } from '@/hooks/use-enhanced-profile-details';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIPFormData } from '@/types/pip';
import { EmployeeProfileCard } from './EmployeeProfileCard';
import { ResourcePlanningOverview } from './ResourcePlanningOverview';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { addMonths, addDays, differenceInDays } from 'date-fns';

const pipFormSchema = z.object({
  profile_id: z.string().min(1, 'Employee is required'),
  overall_feedback: z.string().min(10, 'Overall feedback must be at least 10 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  mid_date: z.string().optional(),
  end_date: z.string().min(1, 'End date is required'),
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

export const PIPInitiationForm: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [hasSetMidDate, setHasSetMidDate] = useState(false);
  const [hasSetEndDate, setHasSetEndDate] = useState(false);
  const { data: profileDetails, isLoading: isLoadingProfile } = useEnhancedProfileDetails(selectedProfileId);
  const { createPIP, isCreating } = usePIPManagement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PIPFormValues>({
    resolver: zodResolver(pipFormSchema),
    defaultValues: {
      profile_id: '',
      overall_feedback: '',
      start_date: '',
      mid_date: '',
      end_date: '',
    }
  });

  const watchedOverallFeedback = watch('overall_feedback');
  const watchedStartDate = watch('start_date');
  const watchedMidDate = watch('mid_date');
  const watchedEndDate = watch('end_date');

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

  // Track when mid date is manually changed
  const handleMidDateChange = (date: string) => {
    setValue('mid_date', date);
    if (date) {
      setHasSetMidDate(true);
    }
  };

  // Track when end date is manually changed
  const handleEndDateChange = (date: string) => {
    setValue('end_date', date);
    if (date) {
      setHasSetEndDate(true);
    }
  };

  const onSubmit = (data: PIPFormValues) => {
    const formData: PIPFormData = {
      profile_id: data.profile_id,
      overall_feedback: data.overall_feedback,
      start_date: data.start_date,
      mid_date: data.mid_date || undefined,
      end_date: data.end_date,
    };

    createPIP(formData, {
      onSuccess: () => {
        reset();
        setSelectedProfileId(null);
        setHasSetMidDate(false);
        setHasSetEndDate(false);
      }
    });
  };

  const handleResetForm = () => {
    reset();
    setSelectedProfileId(null);
    setHasSetMidDate(false);
    setHasSetEndDate(false);
  };

  const getFormCompletionStatus = () => {
    const steps = [
      { name: 'Employee Selected', completed: !!selectedProfileId },
      { name: 'Dates Set', completed: watch('start_date') && watch('end_date') },
      { name: 'Feedback Added', completed: watch('overall_feedback')?.length >= 10 }
    ];
    const completedSteps = steps.filter(step => step.completed).length;
    return { steps, completedSteps, total: steps.length };
  };

  const { steps, completedSteps, total } = getFormCompletionStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Initiate Performance Improvement Plan</CardTitle>
              <CardDescription>
                Create a new PIP for an employee with detailed feedback and timeline
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Progress: {completedSteps}/{total}</span>
              </div>
              <div className="flex gap-1">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`w-8 h-2 rounded ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    title={step.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`w-3 h-3 rounded-full ${selectedProfileId ? 'bg-green-500' : 'bg-gray-300'}`} />
              Step 1: Select Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="profile" className="text-sm font-medium">Select Employee *</Label>
              <ProfileCombobox
                value={selectedProfileId}
                onValueChange={setSelectedProfileId}
                placeholder="Search and select employee..."
                label="Employee"
              />
              {errors.profile_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.profile_id.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Profile Display */}
        {profileDetails && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <EmployeeProfileCard profile={profileDetails} />
            <ResourcePlanningOverview resourcePlanning={profileDetails.resource_planning} />
          </div>
        )}

        {/* Timeline Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`w-3 h-3 rounded-full ${(watchedStartDate && watchedEndDate) ? 'bg-green-500' : 'bg-gray-300'}`} />
              Step 2: Configure Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Start Date *
                </Label>
                <DatePicker
                  value={watchedStartDate}
                  onChange={(date) => setValue('start_date', date)}
                  placeholder="Select start date"
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mid_date" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Mid Review Date
                </Label>
                <DatePicker
                  value={watchedMidDate}
                  onChange={handleMidDateChange}
                  placeholder="Select mid review date"
                />
                {errors.mid_date && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.mid_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  End Date *
                </Label>
                <DatePicker
                  value={watchedEndDate}
                  onChange={handleEndDateChange}
                  placeholder="Select end date"
                />
                {errors.end_date && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`w-3 h-3 rounded-full ${(watchedOverallFeedback?.length >= 10) ? 'bg-green-500' : 'bg-gray-300'}`} />
              Step 3: Performance Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="overall_feedback" className="text-sm font-medium">Overall Feedback *</Label>
              <RichTextEditor
                value={watchedOverallFeedback}
                onChange={(value) => setValue('overall_feedback', value)}
                placeholder="Provide detailed feedback regarding performance issues and improvement areas..."
                className="min-h-[200px]"
              />
              {errors.overall_feedback && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.overall_feedback.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isCreating || !selectedProfileId || isLoadingProfile || completedSteps < total}
                className="flex-1"
              >
                {isCreating ? 'Creating PIP...' : 'Create PIP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                className="flex-1"
              >
                Reset Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
