
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { ResourceAssignmentForm } from './ResourceAssignmentForm';
import { useResourceAssignmentForm } from './hooks/useResourceAssignmentForm';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  engagement_start_date: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  } | null;
}

interface ResourceAssignmentDialogProps {
  mode: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedProfileId?: string | null;
  item?: ResourcePlanningData;
}

export const ResourceAssignmentDialog: React.FC<ResourceAssignmentDialogProps> = ({
  mode,
  open: controlledOpen,
  onOpenChange,
  preselectedProfileId,
  item,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createResourcePlanning, updateResourcePlanning } = usePlannedResources();

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const formState = useResourceAssignmentForm({
    mode,
    preselectedProfileId,
    item,
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.profileId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const resourcePlanningData = formState.getFormData();

    try {
      if (mode === 'edit' && item) {
        await new Promise<void>((resolve, reject) => {
          updateResourcePlanning(
            {
              id: item.id,
              updates: resourcePlanningData,
            },
            {
              onSuccess: () => {
                // Only reset form and close dialog on success
                formState.resetForm();
                setOpen(false);
                resolve();
              },
              onError: (error) => reject(error),
            }
          );
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          createResourcePlanning(resourcePlanningData, {
            onSuccess: () => {
              // Only reset form and close dialog on success
              formState.resetForm();
              setOpen(false);
              resolve();
            },
            onError: (error) => reject(error),
          });
        });
      }
    } catch (error) {
      // Error handling is already done by the mutations via toast
      console.error('Mutation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, mode, item, isSubmitting, updateResourcePlanning, createResourcePlanning, setOpen]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const DialogComponent = () => (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'edit' ? 'Edit Resource Assignment' : 'Create Resource Assignment'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'edit' 
            ? 'Update the resource assignment details.'
            : 'Assign a resource to a project or bill type with engagement details.'
          }
        </DialogDescription>
      </DialogHeader>
      
      <ResourceAssignmentForm
        mode={mode}
        profileId={formState.profileId}
        setProfileId={formState.setProfileId}
        billTypeId={formState.billTypeId}
        setBillTypeId={formState.setBillTypeId}
        projectId={formState.projectId}
        setProjectId={formState.setProjectId}
        engagementPercentage={formState.engagementPercentage}
        setEngagementPercentage={formState.setEngagementPercentage}
        releaseDate={formState.releaseDate}
        setReleaseDate={formState.setReleaseDate}
        engagementStartDate={formState.engagementStartDate}
        setEngagementStartDate={formState.setEngagementStartDate}
        preselectedProfileId={preselectedProfileId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </DialogContent>
  );

  if (controlledOpen !== undefined) {
    // Controlled mode - don't render DialogTrigger
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogComponent />
      </Dialog>
    );
  }

  // Uncontrolled mode - render with trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogComponent />
    </Dialog>
  );
};
