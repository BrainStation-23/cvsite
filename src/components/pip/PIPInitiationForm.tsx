
import React from 'react';
import { useEnhancedProfileDetails } from '@/hooks/use-enhanced-profile-details';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { usePIPForm } from '@/hooks/use-pip-form';
import { PIP, PIPFormData } from '@/types/pip';
import { EmployeeProfileCard } from './EmployeeProfileCard';
import { ResourcePlanningOverview } from './ResourcePlanningOverview';
import { PIPFormProgress } from './forms/PIPFormProgress';
import { PIPEmployeeSelection } from './forms/PIPEmployeeSelection';
import { PIPTimelineConfiguration } from './forms/PIPTimelineConfiguration';
import { PIPFeedbackSection } from './forms/PIPFeedbackSection';
import { PIPActionButtons } from './forms/PIPActionButtons';

interface PIPInitiationFormProps {
  initialData?: PIP | null;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export const PIPInitiationForm: React.FC<PIPInitiationFormProps> = ({
  initialData = null,
  isEditing = false,
  onSuccess
}) => {
  const { data: profileDetails, isLoading: isLoadingProfile } = useEnhancedProfileDetails(
    initialData?.profile_id || null
  );
  const { createPIP, updatePIP, isCreating, isUpdating } = usePIPManagement();

  const handleFormSubmit = (data: PIPFormData) => {
    if (isEditing && initialData) {
      updatePIP({ id: initialData.pip_id, updates: data }, {
        onSuccess: () => {
          onSuccess?.();
        }
      });
    } else {
      createPIP(data, {
        onSuccess: () => {
          pipForm.handleReset();
          onSuccess?.();
        }
      });
    }
  };

  const pipForm = usePIPForm({
    initialData,
    onSubmit: handleFormSubmit
  });

  const {
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
  } = pipForm;

  const { steps, completedSteps, total } = getFormCompletionStatus();
  const isSubmitting = isCreating || isUpdating;
  const isFormValid = !isLoadingProfile && completedSteps >= total;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Progress */}
      <PIPFormProgress
        completedSteps={completedSteps}
        totalSteps={total}
        steps={steps}
      />

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Employee Selection */}
        <PIPEmployeeSelection
          selectedProfileId={selectedProfileId}
          onProfileChange={setSelectedProfileId}
          error={form.formState.errors.profile_id?.message}
          disabled={isEditing}
        />

        {/* Employee Profile Display */}
        {profileDetails && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <EmployeeProfileCard profile={profileDetails} />
            <ResourcePlanningOverview resourcePlanning={profileDetails.resource_planning} />
          </div>
        )}

        {/* Timeline Configuration */}
        <PIPTimelineConfiguration
          startDate={watchedStartDate}
          midDate={watchedMidDate}
          endDate={watchedEndDate}
          onStartDateChange={(date) => form.setValue('start_date', date)}
          onMidDateChange={handleMidDateChange}
          onEndDateChange={handleEndDateChange}
          errors={{
            start_date: form.formState.errors.start_date?.message,
            mid_date: form.formState.errors.mid_date?.message,
            end_date: form.formState.errors.end_date?.message,
          }}
        />

        {/* Feedback Section */}
        <PIPFeedbackSection
          overallFeedback={watchedOverallFeedback}
          finalReview={watchedFinalReview}
          onOverallFeedbackChange={(value) => form.setValue('overall_feedback', value)}
          onFinalReviewChange={(value) => form.setValue('final_review', value)}
          errors={{
            overall_feedback: form.formState.errors.overall_feedback?.message,
            final_review: form.formState.errors.final_review?.message,
          }}
          showFinalReview={isEditing}
        />

        {/* Action Buttons */}
        <PIPActionButtons
          isSubmitting={isSubmitting}
          isFormValid={isFormValid}
          onSubmit={() => form.handleSubmit(handleSubmit)()}
          onReset={handleReset}
          isEditing={isEditing}
        />
      </form>
    </div>
  );
};
