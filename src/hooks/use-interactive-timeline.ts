import { useState, useCallback } from 'react';
import { useResourcePlanningOperations } from './use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

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
  isForecasted?: boolean;
}

// Legacy Project interface for backward compatibility
interface Project {
  id?: string;
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
  isForecasted?: boolean;
}

// Convert Project to EngagementData for backward compatibility
const projectToEngagementData = (project: Project, profileId: string): EngagementData => ({
  id: project.id,
  profileId,
  forecastedProject: project.name,
  engagementPercentage: project.engagementPercentage,
  engagementStartDate: project.startDate,
  releaseDate: project.endDate || undefined,
  isForecasted: project.isForecasted,
});

export const useInteractiveTimeline = () => {
  const [selectedEngagements, setSelectedEngagements] = useState<Set<string>>(new Set());
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

  const handleSelectEngagement = useCallback((resourceId: string, engagementIndex: number) => {
    const engagementKey = `${resourceId}-${engagementIndex}`;
    setSelectedEngagements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(engagementKey)) {
        newSet.delete(engagementKey);
      } else {
        newSet.add(engagementKey);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEngagements(new Set());
  }, []);

  const handleEditEngagement = useCallback((resourceId: string, engagementIndex: number, engagement: EngagementData) => {
    if (!engagement.isForecasted) {
      toast({
        title: 'Cannot Edit',
        description: 'Only forecasted assignments can be edited.',
        variant: 'destructive',
      });
      return;
    }

    setModalState({
      isOpen: true,
      mode: 'edit',
      data: engagement,
    });
  }, [toast]);

  const handleDuplicateEngagement = useCallback(async (resourceId: string, engagementIndex: number, engagement: EngagementData) => {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStart = startOfMonth(nextMonth);
      const nextMonthEnd = endOfMonth(nextMonth);
      
      const planningData = {
        profile_id: engagement.profileId,
        project_id: engagement.projectId,
        bill_type_id: engagement.billTypeId,
        forecasted_project: engagement.forecastedProject,
        engagement_percentage: engagement.engagementPercentage,
        billing_percentage: engagement.billingPercentage,
        engagement_start_date: format(nextMonthStart, 'yyyy-MM-dd'),
        release_date: format(nextMonthEnd, 'yyyy-MM-dd'),
      };

      await createResourcePlanning(planningData);
      
      toast({
        title: 'Assignment Duplicated',
        description: `Successfully created assignment for ${format(nextMonth, 'MMMM yyyy')}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate assignment. Please try again.',
        variant: 'destructive',
      });
    }
  }, [createResourcePlanning, toast]);

  const handleDeleteEngagement = useCallback((resourceId: string, engagementIndex: number, engagement: EngagementData) => {
    if (!engagement.isForecasted) {
      toast({
        title: 'Cannot Delete',
        description: 'Only forecasted assignments can be deleted.',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this forecasted assignment?');
    if (confirmed && engagement.id) {
      deleteResourcePlanning(engagement.id);
      toast({
        title: 'Assignment Deleted',
        description: 'The forecasted assignment has been removed.',
      });
    }
  }, [toast, deleteResourcePlanning]);

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

  // Backward compatibility wrapper functions
  const handleEditProject = useCallback((resourceId: string, projectIndex: number, project: Project) => {
    const engagement = projectToEngagementData(project, resourceId);
    handleEditEngagement(resourceId, projectIndex, engagement);
  }, [handleEditEngagement]);

  const handleDuplicateProject = useCallback(async (resourceId: string, projectIndex: number, project: Project) => {
    const engagement = projectToEngagementData(project, resourceId);
    await handleDuplicateEngagement(resourceId, projectIndex, engagement);
  }, [handleDuplicateEngagement]);

  const handleDeleteProject = useCallback((resourceId: string, projectIndex: number, project: Project) => {
    const engagement = projectToEngagementData(project, resourceId);
    handleDeleteEngagement(resourceId, projectIndex, engagement);
  }, [handleDeleteEngagement]);

  return {
    selectedEngagements,
    modalState,
    handleSelectEngagement,
    clearSelection,
    handleEditEngagement,
    handleDuplicateEngagement,
    handleDeleteEngagement,
    handleCreateEngagement,
    handleSaveEngagement,
    closeModal,
    isLoading: isCreating || isUpdating || isDeleting,
    // Backward compatibility aliases
    selectedProjects: selectedEngagements,
    handleSelectProject: handleSelectEngagement,
    handleEditProject,
    handleDuplicateProject,
    handleDeleteProject,
  };
};