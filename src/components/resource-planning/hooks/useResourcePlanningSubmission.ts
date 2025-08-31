
import { useState } from 'react';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';

interface UseResourcePlanningSubmissionProps {
  editingItem: any | null;
  formState: {
    profileId: string | null;
    getFormData: () => any;
    resetForm: () => void;
  };
  onSuccess: () => void;
}

export const useResourcePlanningSubmission = ({
  editingItem,
  formState,
  onSuccess,
}: UseResourcePlanningSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createResourcePlanning, updateResourcePlanning } = useResourcePlanningOperations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.profileId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const resourcePlanningData = formState.getFormData();

    try {
      if (editingItem) {
        await new Promise<void>((resolve, reject) => {
          updateResourcePlanning(
            {
              id: editingItem.id,
              updates: resourcePlanningData,
            },
            {
              onSuccess: () => {
                toast({
                  title: "Success",
                  description: "Resource assignment updated successfully",
                });
                formState.resetForm();
                onSuccess();
                resolve();
              },
              onError: (error) => {
                toast({
                  title: "Error",
                  description: "Failed to update resource assignment",
                  variant: "destructive",
                });
                reject(error);
              },
            }
          );
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          createResourcePlanning(resourcePlanningData, {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Resource assignment created successfully",
              });
              formState.resetForm();
              onSuccess();
              resolve();
            },
            onError: (error) => {
              toast({
                title: "Error",
                description: "Failed to create resource assignment",
                variant: "destructive",
              });
              reject(error);
            },
          });
        });
      }
    } catch (error) {
      console.error('Resource planning submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};
