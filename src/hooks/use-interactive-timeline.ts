
import { useState, useCallback } from 'react';
import { useResourcePlanningOperations } from './use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Project {
  id?: string;
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
  isForecasted?: boolean;
  billTypeId?: string;
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

  const handleEditProject = useCallback((resourceId: string, projectIndex: number, project: Project) => {
    console.log('Editing project:', { resourceId, projectIndex, project });
    
    // Only allow editing of forecasted projects
    if (!project.isForecasted) {
      toast({
        title: 'Cannot Edit',
        description: 'Only forecasted projects can be edited.',
        variant: 'destructive',
      });
      return;
    }

    setModalState({
      isOpen: true,
      mode: 'edit',
      data: {
        id: project.id,
        profileId: resourceId,
        billTypeId: project.billTypeId,
        forecastedProject: project.name,
        engagementPercentage: project.engagementPercentage,
        engagementStartDate: project.startDate,
        releaseDate: project.endDate || undefined,
      },
    });
  }, [toast]);

  const handleDuplicateProject = useCallback(async (resourceId: string, projectIndex: number, project: Project) => {
    try {
      // Calculate next month dates
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStart = startOfMonth(nextMonth);
      const nextMonthEnd = endOfMonth(nextMonth);
      
      // Create planning data for next month
      const planningData = {
        profile_id: resourceId,
        forecasted_project: project.name,
        engagement_percentage: project.engagementPercentage,
        engagement_start_date: format(nextMonthStart, 'yyyy-MM-dd'),
        release_date: format(nextMonthEnd, 'yyyy-MM-dd'),
        bill_type_id: project.billTypeId,
      };

      await createResourcePlanning(planningData);
      
      toast({
        title: 'Forecast Duplicated',
        description: `Successfully created forecast for ${format(nextMonth, 'MMMM yyyy')}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate forecast. Please try again.',
        variant: 'destructive',
      });
    }
  }, [createResourcePlanning, toast]);

  const handleDeleteProject = useCallback((resourceId: string, projectIndex: number, project: Project) => {
    if (!project.isForecasted) {
      toast({
        title: 'Cannot Delete',
        description: 'Only forecasted projects can be deleted.',
        variant: 'destructive',
      });
      return;
    }

    // Use custom confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this forecasted assignment?');
    if (confirmed && project.id) {
      deleteResourcePlanning(project.id);
      toast({
        title: 'Forecast Deleted',
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
