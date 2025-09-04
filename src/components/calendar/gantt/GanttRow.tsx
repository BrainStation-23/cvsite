import React from 'react';
import { GanttResourceData, GanttEngagement, GanttTimelineMonth } from './types';
import { GanttCell } from './GanttCell';
import { calculateEngagementPosition } from './utils';

interface GanttRowProps {
  resource: GanttResourceData;
  timeline: GanttTimelineMonth[];
  onEngagementClick?: (engagement: GanttEngagement) => void;
}

export const GanttRow: React.FC<GanttRowProps> = ({
  resource,
  timeline,
  onEngagementClick
}) => {
  const timelineStart = timeline[0]?.weeks[0]?.weekStart;
  const timelineEnd = timeline[timeline.length - 1]?.weeks[timeline[timeline.length - 1].weeks.length - 1]?.weekEnd;

  if (!timelineStart || !timelineEnd) return null;

  return (
    <div className="flex border-b hover:bg-muted/50 transition-colors">
      {/* Resource info column */}
      <div className="w-80 flex-shrink-0 border-r p-4 space-y-1">
        <div className="font-medium text-sm">
          {resource.profile.first_name} {resource.profile.last_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {resource.profile.current_designation}
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {resource.profile.employee_id}
        </div>
        <div className="text-xs text-muted-foreground">
          {resource.engagements.length} engagement{resource.engagements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 relative h-12">
        {/* Week grid background */}
        <div className="absolute inset-0 flex">
          {timeline.map((month, monthIndex) => (
            <div key={monthIndex} className="flex-1 flex">
              {month.weeks.map((week, weekIndex) => (
                <div
                  key={`${monthIndex}-${weekIndex}`}
                  className={`flex-1 border-r last:border-r-0 ${
                    week.isCurrentWeek ? 'bg-primary/5' : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Engagement cells */}
        {resource.engagements.map((engagement, index) => {
          const position = calculateEngagementPosition(
            engagement,
            timelineStart,
            timelineEnd,
            100 // percentage-based positioning
          );

          return (
            <GanttCell
              key={`${engagement.id}-${index}`}
              engagement={engagement}
              position={position}
              onEngagementClick={onEngagementClick}
            />
          );
        })}
      </div>
    </div>
  );
};