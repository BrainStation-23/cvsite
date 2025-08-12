
import React from 'react';
import { ResourceAssignmentForm } from './ResourceAssignmentForm';
import { useResourceAssignmentForm } from './hooks/useResourceAssignmentForm';
import { useResourcePlanningSubmission } from './hooks/useResourcePlanningSubmission';

interface CreateResourcePlanningFormProps {
  onSuccess: () => void;
}

export const CreateResourcePlanningForm: React.FC<CreateResourcePlanningFormProps> = ({ onSuccess }) => {
  const formState = useResourceAssignmentForm({
    mode: 'create',
    preselectedProfileId: null,
    item: null,
  });

  const { handleSubmit, isSubmitting } = useResourcePlanningSubmission({
    editingItem: null,
    formState,
    onSuccess,
  });

  const handleCancel = () => {
    formState.resetForm();
  };

  return (
    <div className="space-y-4">
      <ResourceAssignmentForm
        mode="create"
        profileId={formState.profileId}
        setProfileId={formState.setProfileId}
        billTypeId={formState.billTypeId}
        setBillTypeId={formState.setBillTypeId}
        projectId={formState.projectId}
        setProjectId={formState.setProjectId}
        engagementPercentage={formState.engagementPercentage}
        setEngagementPercentage={formState.setEngagementPercentage}
        billingPercentage={formState.billingPercentage}
        setBillingPercentage={formState.setBillingPercentage}
        releaseDate={formState.releaseDate}
        setReleaseDate={formState.setReleaseDate}
        engagementStartDate={formState.engagementStartDate}
        setEngagementStartDate={formState.setEngagementStartDate}
        preselectedProfileId={null}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};
