
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { usePIPPMFeedback } from '@/hooks/use-pip-pm-feedback';
import { PIPPMFeedbackForm } from '@/components/pip/pm-feedback/PIPPMFeedbackForm';
import { EmployeeHeader } from '@/components/pip/pm-feedback/EmployeeHeader';
import { CollapsibleInfoPanel } from '@/components/pip/pm-feedback/CollapsibleInfoPanel';
import { ProgressIndicator } from '@/components/pip/pm-feedback/ProgressIndicator';
import { PIPPMFeedbackFormData } from '@/types/pip';

const ManagerPMReview: React.FC = () => {
  const { pipId } = useParams<{ pipId: string }>();
  const navigate = useNavigate();
  
  const {
    pipDetails,
    isLoading,
    createPMFeedback,
    updatePMFeedback,
    updatePIPStatus,
    isCreating,
    isUpdating,
    isUpdatingStatus
  } = usePIPPMFeedback(pipId || null);

  const [formData, setFormData] = React.useState<PIPPMFeedbackFormData | null>(null);

  const handleSubmitFeedback = async (data: PIPPMFeedbackFormData) => {
    if (!pipDetails) return;

    setFormData(data);

    if (pipDetails.pm_feedback) {
      updatePMFeedback({ id: pipDetails.pm_feedback.id, updates: data });
    } else {
      createPMFeedback(data);
    }
  };

  const handleSubmitToHR = async () => {
    if (!pipDetails?.pm_feedback) return;
    await updatePIPStatus('hr_review');
    navigate('/manager/pip/pm-review');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading PIP details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!pipDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">PIP not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { pip, profile, sbu, expertise, manager, pm_feedback } = pipDetails;
  const isEditing = !!pm_feedback;
  const isEditable = pip.status === 'pm_feedback';
  
  // Calculate progress
  const currentFormData = formData || pm_feedback;
  const skillSectionComplete = currentFormData?.skill_areas?.length > 0 && 
                              currentFormData?.skill_gap_description?.length >= 10 && 
                              currentFormData?.skill_gap_example?.length >= 10;
  
  const behavioralSectionComplete = currentFormData?.behavioral_areas?.length > 0 && 
                                   currentFormData?.behavioral_gap_description?.length >= 10 && 
                                   currentFormData?.behavioral_gap_example?.length >= 10;
  
  const isFormValid = skillSectionComplete && behavioralSectionComplete;
  const canSubmitToHR = pm_feedback && isFormValid && isEditable;

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <EmployeeHeader
          profile={profile}
          pipStatus={pip.status}
          onBack={() => navigate('/manager/pip/pm-review')}
          onSubmitToHR={canSubmitToHR ? handleSubmitToHR : undefined}
          canSubmitToHR={canSubmitToHR}
          isSubmitting={isUpdatingStatus}
        />

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Project Manager Feedback
            </h2>
            <p className="text-muted-foreground">
              {isEditable 
                ? 'Provide detailed feedback on technical skills and behavioral aspects for this PIP employee.'
                : 'Review the submitted feedback for this PIP employee.'
              }
            </p>
          </div>

          <ProgressIndicator
            skillSectionComplete={skillSectionComplete || false}
            behavioralSectionComplete={behavioralSectionComplete || false}
            isFormValid={isFormValid}
          />

          <CollapsibleInfoPanel
            profile={profile}
            pip={pip}
            sbu={sbu}
            expertise={expertise}
            manager={manager}
          />

          <div className="bg-card border rounded-lg p-6">
            <PIPPMFeedbackForm
              initialData={pm_feedback}
              onSubmit={handleSubmitFeedback}
              isSubmitting={isCreating || isUpdating}
              isEditing={isEditing}
              isReadOnly={!isEditable}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerPMReview;
