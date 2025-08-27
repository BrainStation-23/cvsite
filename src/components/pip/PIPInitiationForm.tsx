
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import DatePicker from '@/components/admin/user/DatePicker';
import { useProfileDetails } from '@/hooks/use-profile-details';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIPFormData } from '@/types/pip';

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

export const PIPInitiationForm: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const { data: profileDetails, isLoading: isLoadingProfile } = useProfileDetails(selectedProfileId);
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
      final_review: '',
    }
  });

  const watchedOverallFeedback = watch('overall_feedback');

  useEffect(() => {
    if (selectedProfileId) {
      setValue('profile_id', selectedProfileId);
    } else {
      setValue('profile_id', '');
    }
  }, [selectedProfileId, setValue]);

  const onSubmit = (data: PIPFormValues) => {
    const formData: PIPFormData = {
      profile_id: data.profile_id,
      overall_feedback: data.overall_feedback,
      start_date: data.start_date,
      mid_date: data.mid_date || undefined,
      end_date: data.end_date,
      final_review: data.final_review || undefined,
    };

    createPIP(formData, {
      onSuccess: () => {
        reset();
        setSelectedProfileId(null);
      }
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Initiate Performance Improvement Plan</CardTitle>
        <CardDescription>
          Create a new PIP for an employee with detailed feedback and timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="profile" className="text-sm font-medium">Select Employee *</Label>
            <ProfileCombobox
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
              placeholder="Search and select employee..."
              label="Employee"
            />
            {errors.profile_id && (
              <p className="text-sm text-destructive">{errors.profile_id.message}</p>
            )}
          </div>

          {/* Employee Details (Read-only) */}
          {profileDetails && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    value={`${profileDetails.first_name || ''} ${profileDetails.last_name || ''}`.trim()}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Employee ID</Label>
                  <Input
                    value={profileDetails.employee_id || 'N/A'}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Designation</Label>
                  <Input
                    value={profileDetails.current_designation || 'N/A'}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">SBU</Label>
                  <Input
                    value={profileDetails.sbu_name || 'N/A'}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Manager</Label>
                  <Input
                    value={profileDetails.manager_name || 'N/A'}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Expertise</Label>
                  <Input
                    value={profileDetails.expertise_name || 'N/A'}
                    readOnly
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">Start Date *</Label>
              <DatePicker
                value={watch('start_date')}
                onChange={(date) => setValue('start_date', date)}
                placeholder="Select start date"
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mid_date" className="text-sm font-medium">Mid Review Date</Label>
              <DatePicker
                value={watch('mid_date')}
                onChange={(date) => setValue('mid_date', date)}
                placeholder="Select mid review date"
              />
              {errors.mid_date && (
                <p className="text-sm text-destructive">{errors.mid_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">End Date *</Label>
              <DatePicker
                value={watch('end_date')}
                onChange={(date) => setValue('end_date', date)}
                placeholder="Select end date"
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="space-y-2">
            <Label htmlFor="overall_feedback" className="text-sm font-medium">Overall Feedback *</Label>
            <RichTextEditor
              value={watchedOverallFeedback}
              onChange={(value) => setValue('overall_feedback', value)}
              placeholder="Provide detailed feedback regarding performance issues and improvement areas..."
              className="min-h-[200px]"
            />
            {errors.overall_feedback && (
              <p className="text-sm text-destructive">{errors.overall_feedback.message}</p>
            )}
          </div>

          {/* Final Review (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="final_review" className="text-sm font-medium">Final Review (Optional)</Label>
            <RichTextEditor
              value={watch('final_review') || ''}
              onChange={(value) => setValue('final_review', value)}
              placeholder="This can be filled later when the PIP is completed..."
              className="min-h-[150px]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isCreating || !selectedProfileId || isLoadingProfile}
              className="flex-1"
            >
              {isCreating ? 'Creating PIP...' : 'Create PIP'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedProfileId(null);
              }}
              className="flex-1"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
