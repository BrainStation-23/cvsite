
import React from 'react';
import { ResourceAssignmentForm } from './ResourceAssignmentForm';
import { useResourceAssignmentForm } from './hooks/useResourceAssignmentForm';
import { useResourcePlanningSubmission } from './hooks/useResourcePlanningSubmission';

interface ResourcePlanningFormProps {
  preselectedProfileId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResourcePlanningForm: React.FC<ResourcePlanningFormProps> = ({
  preselectedProfileId,
  onSuccess,
  onCancel,
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

  const handleCancel = () => {
    formState.resetForm();
    onCancel();
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30 h-fit">
      <h3 className="text-lg font-semibold mb-4">Create Resource Assignment</h3>
      <ResourceAssignmentForm
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};
