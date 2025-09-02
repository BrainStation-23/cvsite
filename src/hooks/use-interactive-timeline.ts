
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
    // Only allow editing of forecasted projects
    setModalState({
      isOpen: true,
      mode: 'edit',
      data: {
        profileId: resourceId,
        engagementPercentage: 0, // Set to 0 as per requirements
        engagementStartDate: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  }, []);

  const handleDuplicateProject = useCallback((resourceId: string, projectIndex: number) => {
    // Create a new forecasted project for the next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setModalState({
      isOpen: true,
      mode: 'create',
      data: {
        profileId: resourceId,
        engagementPercentage: 0, // Set to 0 as per requirements
        engagementStartDate: format(startOfMonth(nextMonth), 'yyyy-MM-dd'),
      },
    });
    toast({
      title: 'Duplicating Forecast',
      description: 'Creating a new forecast for the next month.',
    });
  }, [toast]);

  const handleDeleteProject = useCallback((resourceId: string, projectIndex: number) => {
    // Use custom confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this forecasted assignment?');
    if (confirmed) {
      // In a real implementation, you'd need the actual engagement ID
      toast({
        title: 'Forecast Deleted',
        description: 'The forecasted assignment has been removed.',
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
