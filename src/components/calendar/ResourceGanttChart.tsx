import React, { useEffect, useMemo } from 'react';
import { Gantt } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import { GanttTask } from '../../hooks/use-gantt-resource-data';
import { format, addMonths } from 'date-fns';

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
  // Generate dynamic CSS for bill type colors
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'gantt-bill-type-styles';
    
    // Remove existing styles
    const existingStyle = document.getElementById('gantt-bill-type-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Generate CSS for each unique bill type color
    const colorCodes = new Set<string>();
    tasks.forEach(task => {
      if (task.data?.colorCode) {
        colorCodes.add(task.data.colorCode);
      }
    });

    let css = '';
    colorCodes.forEach(color => {
      const className = `bill-type-${color.replace('#', '')}`;
      css += `
        .wx-gantt .${className} .wx-gantt-task-content {
          background: ${color} !important;
          border-color: ${color} !important;
        }
        .wx-gantt .${className} .wx-gantt-task-content:hover {
          background: ${color}dd !important;
        }
      `;
    });

    // Add general employee row styling
    css += `
      .wx-gantt .employee-row .wx-gantt-row {
        background: hsl(var(--muted)) !important;
        font-weight: 600;
      }
      .wx-gantt .engagement-row .wx-gantt-row:hover {
        background: hsl(var(--muted)/0.5) !important;
      }
    `;

    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      if (document.getElementById('gantt-bill-type-styles')) {
        document.getElementById('gantt-bill-type-styles')?.remove();
      }
    };
  }, [tasks]);

  // Configure Gantt columns
  const columns = useMemo(() => [
    {
      name: "text",
      label: "Resource / Engagement",
      width: 300,
      template: (task: GanttTask) => {
        if (task.data?.isEmployee) {
          return `
            <div class="font-semibold text-foreground">
              ${task.text}
              <div class="text-xs text-muted-foreground mt-1">
                ${task.data.designation} • ${task.data.sbu}
              </div>
            </div>
          `;
        }
        return `<div class="text-sm pl-4">${task.text}</div>`;
      }
    },
    {
      name: "start",
      label: "Start Date",
      width: 100,
      template: (task: GanttTask) => {
        if (task.start) {
          return format(task.start, 'MMM dd');
        }
        return '';
      }
    },
    {
      name: "duration",
      label: "Duration",
      width: 80,
      template: (task: GanttTask) => {
        if (task.start && task.end) {
          const diffTime = task.end.getTime() - task.start.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays}d`;
        }
        return task.data?.isEmployee ? '' : 'Ongoing';
      }
    },
    {
      name: "progress",
      label: "Engagement %",
      width: 100,
      template: (task: GanttTask) => {
        if (task.data?.engagementPercentage) {
          return `${task.data.engagementPercentage}%`;
        }
        return '';
      }
    }
  ], []);

  // Configure scales for 6-month view
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

  // Configure task template for custom styling
  const taskTemplate = useMemo(() => (task: GanttTask) => {
    if (task.data?.isEmployee) {
      return '';
    }
    
    const colorCode = task.data?.colorCode || '#6b7280';
    const className = `bill-type-${colorCode.replace('#', '')}`;
    
    return `<div class="${className}"></div>`;
  }, []);

  // Set start and end dates for timeline
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
        <div className="text-destructive">Error loading resource data</div>
      </div>
    );
  }

  if (tasks.length === 0) {
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
          tasks={tasks}
          columns={columns}
          scales={scales}
          start={startDate}
          end={endDate}
          cellWidth={40}
          cellHeight={40}
          readonly={true}
          taskTemplate={taskTemplate}
          rowClass={(task: GanttTask) => {
            return task.data?.isEmployee ? 'employee-row' : 'engagement-row';
          }}
          tooltip={(task: GanttTask) => {
            if (task.data?.isEmployee) {
              return `
                <div class="p-2">
                  <div class="font-semibold">${task.text}</div>
                  <div class="text-sm text-muted-foreground">
                    ${task.data.designation}<br/>
                    ${task.data.sbu}<br/>
                    Manager: ${task.data.manager}
                  </div>
                </div>
              `;
            } else {
              return `
                <div class="p-2">
                  <div class="font-semibold">${task.data?.projectName}</div>
                  <div class="text-sm">
                    Client: ${task.data?.clientName || 'N/A'}<br/>
                    Engagement: ${task.data?.engagementPercentage}%<br/>
                    Billing: ${task.data?.billingPercentage}%<br/>
                    Bill Type: ${task.data?.billType?.name || 'N/A'}<br/>
                    PM: ${task.data?.projectManager || 'N/A'}
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>
    </div>
  );
};