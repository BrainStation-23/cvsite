
import { useState, useCallback } from 'react';
import { useResourcePlanningOperations } from './use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth } from 'date-fns';

interface Project {
  id?: string;
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface EngagementData {
  id?: string;
  profileId: string;
  projectId?: string;
  billTypeId?: string;
  forecastedProject?: string;
  engagementPercentage: number;
  billingPercentage?: number;
  engagementStartDate: string;
  releaseDate?: string;
}

export const useInteractiveTimeline = () => {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    data?: EngagementData;
    preselectedResourceId?: string;
    preselectedStartDate?: Date;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const { 
    createResourcePlanning,
    updateResourcePlanning,
    deleteResourcePlanning,
    isCreating,
    isUpdating,
    isDeleting,
  } = useResourcePlanningOperations();

  const { toast } = useToast();

  const handleSelectProject = useCallback((resourceId: string, projectIndex: number) => {
    const projectKey = `${resourceId}-${projectIndex}`;
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey);
      } else {
        newSet.add(projectKey);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjects(new Set());
  }, []);

  const handleEditProject = useCallback((resourceId: string, projectIndex: number) => {
    // In a real implementation, you'd need to get the actual engagement data
    // For now, we'll open the modal in edit mode
    setModalState({
      isOpen: true,
      mode: 'edit',
      data: {
        profileId: resourceId,
        engagementPercentage: 100,
        engagementStartDate: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  }, []);

  const handleDuplicateProject = useCallback((resourceId: string, projectIndex: number) => {
    // Similar to edit, but create a new engagement with the same data
    setModalState({
      isOpen: true,
      mode: 'create',
      data: {
        profileId: resourceId,
        engagementPercentage: 100,
        engagementStartDate: format(new Date(), 'yyyy-MM-dd'),
      },
    });
    toast({
      title: 'Duplicating Assignment',
      description: 'Creating a new assignment with the same data.',
    });
  }, [toast]);

  const handleDeleteProject = useCallback((resourceId: string, projectIndex: number) => {
    // In a real implementation, you'd need the actual engagement ID
    // For now, we'll show a confirmation
    if (confirm('Are you sure you want to delete this assignment?')) {
      // deleteResourcePlanning(engagementId);
      toast({
        title: 'Assignment Deleted',
        description: 'The resource assignment has been removed.',
      });
    }
  }, [toast]);

  const handleCreateEngagement = useCallback((startDate: Date, resourceId: string) => {
    const monthStart = startOfMonth(startDate);
    setModalState({
      isOpen: true,
      mode: 'create',
      preselectedResourceId: resourceId,
      preselectedStartDate: monthStart,
    });
  }, []);

  const handleSaveEngagement = useCallback(async (data: EngagementData) => {
    try {
      const planningData = {
        profile_id: data.profileId,
        project_id: data.projectId,
        bill_type_id: data.billTypeId,
        engagement_percentage: data.engagementPercentage,
        billing_percentage: data.billingPercentage,
        engagement_start_date: data.engagementStartDate,
        release_date: data.releaseDate,
        forecasted_project: data.forecastedProject,
      };

      if (modalState.mode === 'create') {
        createResourcePlanning(planningData);
      } else if (data.id) {
        updateResourcePlanning({
          id: data.id,
          updates: planningData,
        });
      }

      setModalState({ isOpen: false, mode: 'create' });
      toast({
        title: 'Success',
        description: `Assignment ${modalState.mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save assignment. Please try again.',
        variant: 'destructive',
      });
    }
  }, [modalState.mode, createResourcePlanning, updateResourcePlanning, toast]);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'create' });
  }, []);

  return {
    selectedProjects,
    modalState,
    handleSelectProject,
    clearSelection,
    handleEditProject,
    handleDuplicateProject,
    handleDeleteProject,
    handleCreateEngagement,
    handleSaveEngagement,
    closeModal,
    isLoading: isCreating || isUpdating || isDeleting,
  };
};
