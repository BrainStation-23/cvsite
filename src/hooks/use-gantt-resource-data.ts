import { useMemo } from 'react';
import { useResourceCalendarData, ResourceCalendarData } from './use-resource-calendar-data';
import { format, addMonths } from 'date-fns';

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
      const parentId = `employee-${profile.id}`;
      
      // Process child tasks (Engagements) first to determine if parent has children
      const validEngagements: any[] = [];
      
      group.engagements.forEach((engagement, index) => {
        const startDate = engagement.engagement_start_date ? new Date(engagement.engagement_start_date) : null;
        const endDate = engagement.release_date ? new Date(engagement.release_date) : null;
        
        console.log('Processing engagement:', engagement.id, startDate, endDate);
        
        if (startDate && !isNaN(startDate.getTime())) { // Validate start date
          const taskId = `engagement-${engagement.profile_id}-${index}`;
          const projectName = engagement.project?.project_name || 'Unassigned';
          const engagementPercentage = engagement.engagement_percentage || 0;
          
          // Calculate duration if end date is valid
          let duration = undefined;
          if (endDate && !isNaN(endDate.getTime())) {
            const diffTime = endDate.getTime() - startDate.getTime();
            duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
          
          const taskData = {
            id: taskId,
            text: `${projectName} (${engagementPercentage}%)`,
            start: startDate,
            end: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
            duration: duration,
            progress: engagementPercentage / 100,
            type: 'task', // Required type for child tasks
            parent: parentId, // Required parent reference
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
          };
          
          console.log('Adding task:', taskData);
          validEngagements.push(taskData);
        } else {
          console.warn('Skipping engagement with invalid start date:', engagement.id, engagement.engagement_start_date);
        }
      });

      // Add parent task - ALL summary tasks need start/end dates for wx-react-gantt
      const parentStartDate = startingMonth;
      const parentEndDate = addMonths(startingMonth, 5);
      
      if (validEngagements.length > 0) {
        // Parent task (Employee) with subtasks - still needs start/end dates
        tasks.push({
          id: parentId,
          text: `${profile.first_name} ${profile.last_name} (${profile.employee_id})`,
          type: 'summary', // Required type for parent tasks
          start: parentStartDate, // Required for ALL summary tasks
          end: parentEndDate, // Required for ALL summary tasks
          open: true,
          data: {
            isEmployee: true,
            designation: profile.current_designation,
            employeeId: profile.employee_id
          }
        });
        
        // Add all valid child tasks
        tasks.push(...validEngagements);
        
        console.log('Adding parent task with', validEngagements.length, 'children:', parentId, profile);
      } else {
        // Parent task without subtasks - must have start/end dates
        tasks.push({
          id: parentId,
          text: `${profile.first_name} ${profile.last_name} (${profile.employee_id}) - No Assignments`,
          type: 'summary',
          start: parentStartDate,
          end: parentEndDate,
          open: true,
          data: {
            isEmployee: true,
            designation: profile.current_designation,
            employeeId: profile.employee_id,
            noAssignments: true
          }
        });
        
        console.log('Adding parent task without children (with dates):', parentId, profile);
      }
    });

    console.log('Final gantt tasks:', tasks);
    return tasks;
  }, [resourceData]);

  return {
    ganttTasks,
    isLoading,
    error
  };
};