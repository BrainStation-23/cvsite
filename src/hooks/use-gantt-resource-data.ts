import { useMemo } from 'react';
import { useResourceCalendarData, ResourceCalendarData } from './use-resource-calendar-data';
import { format } from 'date-fns';

export interface GanttTask {
  id: string;
  text: string;
  start?: Date;
  end?: Date;
  duration?: number;
  progress?: number;
  type?: string;
  parent?: string;
  open?: boolean;
  data?: any;
}

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  projectLevelFilter: string | null;
  projectBillTypeFilter: string | null;
}

export const useGanttResourceData = (
  searchQuery: string,
  selectedSbu: string | null,
  selectedManager: string | null,
  startingMonth: Date,
  advancedFilters: AdvancedFilters = {
    billTypeFilter: null,
    projectSearch: '',
    minEngagementPercentage: null,
    maxEngagementPercentage: null,
    minBillingPercentage: null,
    maxBillingPercentage: null,
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    projectLevelFilter: null,
    projectBillTypeFilter: null,
  }
) => {
  const { data: resourceData, isLoading, error } = useResourceCalendarData(
    searchQuery,
    selectedSbu,
    selectedManager,
    startingMonth,
    advancedFilters
  );

  const ganttTasks = useMemo(() => {
    if (!resourceData || resourceData.length === 0) return [];

    // Group engagements by employee profile
    const employeeGroups = resourceData.reduce((acc, resource) => {
      const employeeKey = `${resource.profile_id}`;
      
      if (!acc[employeeKey]) {
        acc[employeeKey] = {
          profile: resource.profile,
          engagements: []
        };
      }
      
      acc[employeeKey].engagements.push(resource);
      return acc;
    }, {} as Record<string, { profile: ResourceCalendarData['profile']; engagements: ResourceCalendarData[] }>);

    const tasks: GanttTask[] = [];

    // Create parent and child tasks
    Object.entries(employeeGroups).forEach(([employeeKey, group]: [string, { profile: ResourceCalendarData['profile']; engagements: ResourceCalendarData[] }]) => {
      const profile = group.profile;
      
      // Parent task (Employee)
      const parentId = `employee-${profile.id}`;
      tasks.push({
        id: parentId,
        text: `${profile.first_name} ${profile.last_name} (${profile.employee_id})`,
        type: 'project',
        open: true,
        data: {
          isEmployee: true,
          designation: profile.current_designation,
          employeeId: profile.employee_id
        }
      });

      // Child tasks (Engagements)
      group.engagements.forEach((engagement, index) => {
        const startDate = engagement.engagement_start_date ? new Date(engagement.engagement_start_date) : null;
        const endDate = engagement.release_date ? new Date(engagement.release_date) : null;
        
        if (startDate) {
          const taskId = `engagement-${engagement.profile_id}-${index}`;
          const projectName = engagement.project?.project_name || 'Unassigned';
          const engagementPercentage = engagement.engagement_percentage || 0;
          
          tasks.push({
            id: taskId,
            text: `${projectName} (${engagementPercentage}%)`,
            start: startDate,
            end: endDate,
            progress: engagementPercentage / 100,
            type: 'task',
            parent: parentId,
            data: {
              isEngagement: true,
              projectName,
              clientName: engagement.project?.client_name,
              engagementPercentage,
              billingPercentage: engagement.billing_percentage,
              billType: engagement.bill_type,
              projectManager: engagement.project?.project_manager,
              startDate: engagement.engagement_start_date,
              endDate: engagement.release_date,
              colorCode: engagement.bill_type?.color_code || '#6b7280'
            }
          });
        }
      });
    });

    return tasks;
  }, [resourceData]);

  return {
    ganttTasks,
    isLoading,
    error
  };
};