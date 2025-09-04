import React, { useEffect, useMemo } from 'react';
import { Gantt } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import { GanttTask } from '../../hooks/use-gantt-resource-data';
import { format, addMonths, isValid } from 'date-fns';

interface ResourceGanttChartProps {
  tasks: GanttTask[];
  isLoading: boolean;
  error: any;
  currentMonth: Date;
}

export const ResourceGanttChart: React.FC<ResourceGanttChartProps> = ({
  tasks,
  isLoading,
  error,
  currentMonth
}) => {
  // Process and validate tasks for Gantt compatibility
  const validatedTasks = useMemo(() => {
    return tasks.map(task => {
      // Ensure all required fields are present and valid
      const validatedTask = {
        id: task.id,
        text: task.text || 'Untitled',
        type: task.type || 'task',
        ...task
      };

      // Validate dates for child tasks (type === 'task')
      if (task.type === 'task' && task.start) {
        const startDate = new Date(task.start);
        const endDate = task.end ? new Date(task.end) : null;
        
        if (isValid(startDate)) {
          validatedTask.start = startDate;
          if (endDate && isValid(endDate)) {
            validatedTask.end = endDate;
            // Calculate duration in days
            const diffTime = endDate.getTime() - startDate.getTime();
            validatedTask.duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          } else {
            // If no end date, set duration to extend to end of timeline
            const timelineEnd = addMonths(currentMonth, 5);
            const diffTime = timelineEnd.getTime() - startDate.getTime();
            validatedTask.duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
        } else {
          // If invalid start date, skip this task
          return null;
        }
      }
      
      // Validate dates for summary tasks (type === 'summary')
      if (task.type === 'summary' && task.start) {
        const startDate = new Date(task.start);
        const endDate = task.end ? new Date(task.end) : null;
        
        if (isValid(startDate)) {
          validatedTask.start = startDate;
          if (endDate && isValid(endDate)) {
            validatedTask.end = endDate;
          } else {
            // For summary tasks without end date, extend to timeline end
            validatedTask.end = addMonths(currentMonth, 5);
          }
        }
      }

      // Ensure progress is between 0 and 1
      if (task.progress !== undefined) {
        validatedTask.progress = Math.max(0, Math.min(1, task.progress));
      }

      return validatedTask;
    }).filter(Boolean); // Remove null tasks
  }, [tasks, currentMonth]);

  // Configure Gantt columns
  const columns = useMemo(() => [
    {
      name: "text",
      label: "Resource / Engagement",
      width: 300,
      template: (task: any) => {
        if (task.data?.isEmployee) {
          return `
            <div style="font-weight: 600; color: var(--foreground);">
              ${task.text}
              <div style="font-size: 12px; color: var(--muted-foreground); margin-top: 4px;">
                ${task.data.designation || ''} ${task.data.employeeId ? '• ' + task.data.employeeId : ''}
              </div>
            </div>
          `;
        }
        return `<div style="font-size: 14px; padding-left: 16px;">${task.text}</div>`;
      }
    },
    {
      name: "start",
      label: "Start Date",
      width: 100,
      template: (task: any) => {
        if (task.start && isValid(new Date(task.start))) {
          return format(new Date(task.start), 'MMM dd');
        }
        return '';
      }
    },
    {
      name: "duration",
      label: "Duration",
      width: 80,
      template: (task: any) => {
        if (task.duration) {
          return `${task.duration}d`;
        }
        return task.data?.isEmployee ? '' : 'Ongoing';
      }
    },
    {
      name: "progress",
      label: "Engagement %",
      width: 100,
      template: (task: any) => {
        if (task.data?.engagementPercentage) {
          return `${task.data.engagementPercentage}%`;
        }
        return '';
      }
    }
  ], []);

  // Configure scales for timeline
  const scales = useMemo(() => [
    {
      unit: "month",
      step: 1,
      format: "MMMM yyyy"
    },
    {
      unit: "week", 
      step: 1,
      format: "MMM dd"
    }
  ], []);

  // Set timeline bounds
  const startDate = currentMonth;
  const endDate = addMonths(currentMonth, 5);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">Loading resource calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="text-destructive">Error loading resource data: {error.message}</div>
      </div>
    );
  }

  if (validatedTasks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">No resource data found for the selected criteria</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="h-[600px]">
        <Gantt
          tasks={validatedTasks}
          columns={columns}
          scales={scales}
          start={startDate}
          end={endDate}
          cellWidth={40}
          cellHeight={40}
          readonly={true}
        />
      </div>
    </div>
  );
};