import React, { useMemo } from 'react';
import { GanttResourceData, GanttEngagement, GanttTimelineMonth } from './types';
import { GanttCell } from './GanttCell';
import { calculateEngagementPosition, assignEngagementTracks, calculateMaxTracks } from './utils';

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

  const { trackAssignments, maxTracks, rowHeight } = useMemo(() => {
    if (!resource.engagements.length) {
      return { trackAssignments: new Map(), maxTracks: 1, rowHeight: 48 };
    }

    const assignments = assignEngagementTracks(resource.engagements);
    const tracks = calculateMaxTracks(resource.engagements);
    const trackHeight = 22; // Height per track
    const trackSpacing = 2; // Gap between tracks
    const padding = 8; // Top and bottom padding
    
    const calculatedHeight = Math.max(48, (tracks * trackHeight) + ((tracks - 1) * trackSpacing) + padding);
    
    return { 
      trackAssignments: assignments, 
      maxTracks: tracks, 
      rowHeight: calculatedHeight 
    };
  }, [resource.engagements]);

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
      <div className="flex-1 relative" style={{ height: `${rowHeight}px` }}>
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
          const track = trackAssignments.get(engagement.id) || 0;
          const position = calculateEngagementPosition(
            engagement,
            timelineStart,
            timelineEnd,
            100, // percentage-based positioning
            track,
            22 // track height
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