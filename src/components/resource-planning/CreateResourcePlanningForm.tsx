
import React from 'react';
import { ResourceAssignmentForm } from './ResourceAssignmentForm';
import { useResourceAssignmentForm } from './hooks/useResourceAssignmentForm';
import { useResourcePlanningSubmission } from './hooks/useResourcePlanningSubmission';

interface CreateResourcePlanningFormProps {
  preselectedProfileId?: string | null;
  onSuccess: () => void;
}

export const CreateResourcePlanningForm: React.FC<CreateResourcePlanningFormProps> = ({ 
  preselectedProfileId = null,
  onSuccess 
}) => {
  const formState = useResourceAssignmentForm({
    mode: 'create',
    preselectedProfileId,
    item: null,
  });

  const { handleSubmit, isSubmitting } = useResourcePlanningSubmission({
    editingItem: null,
    formState,
    onSuccess,
  });

  return (
    <div className="space-y-4">
      <ResourceAssignmentForm
        profileId={formState.profileId}
        setProfileId={formState.setProfileId}
        billTypeId={formState.billTypeId}
        setBillTypeId={formState.setBillTypeId}
        projectId={formState.projectId}
        setProjectId={formState.setProjectId}
        forecastedProject=""
        setForecastedProject={() => {}}
        engagementPercentage={formState.engagementPercentage}
        setEngagementPercentage={formState.setEngagementPercentage}
        billingPercentage={formState.billingPercentage}
        setBillingPercentage={formState.setBillingPercentage}
        releaseDate={formState.releaseDate}
        setReleaseDate={formState.setReleaseDate}
        engagementStartDate={formState.engagementStartDate}
        setEngagementStartDate={formState.setEngagementStartDate}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};
