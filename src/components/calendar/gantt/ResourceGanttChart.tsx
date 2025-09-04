import React, { useMemo } from 'react';
import { ResourceCalendarData } from '@/hooks/use-resource-calendar-data';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { transformResourceDataToGantt, generateTimeline } from './utils';
import { GanttEngagement } from './types';

interface ResourceGanttChartProps {
  resourceData: ResourceCalendarData[];
  currentMonth: Date;
  isLoading?: boolean;
  onEngagementClick?: (engagement: GanttEngagement) => void;
}

export const ResourceGanttChart: React.FC<ResourceGanttChartProps> = ({
  resourceData,
  currentMonth,
  isLoading = false,
  onEngagementClick
}) => {
  const ganttData = useMemo(() => 
    transformResourceDataToGantt(resourceData), 
    [resourceData]
  );

  const timeline = useMemo(() => 
    generateTimeline(currentMonth), 
    [currentMonth]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (ganttData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center">
          <p className="text-muted-foreground">No resource data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or date range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border overflow-hidden">
      <GanttHeader timeline={timeline} />
      
      <div className="h-full">
        {ganttData.map((resource) => (
          <GanttRow
            key={resource.profile.id}
            resource={resource}
            timeline={timeline}
            onEngagementClick={onEngagementClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Legend</div>
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Billable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Non-billable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Investment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded opacity-50"></div>
              <span>Forecasted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};