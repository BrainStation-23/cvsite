import React, { useMemo } from 'react';
import { GanttResourceData, GanttEngagement, GanttTimelineMonth } from './types';
import { GanttCell } from './GanttCell';
import { calculateEngagementPosition, assignEngagementTracks, calculateMaxTracks, calculateClickedDate } from './utils';

interface GanttRowProps {
  resource: GanttResourceData;
  timeline: GanttTimelineMonth[];
  onEngagementClick?: (engagement: GanttEngagement) => void;
  onEmptySpaceClick?: (resourceId: string, clickDate: Date) => void;
}

export const GanttRow: React.FC<GanttRowProps> = ({ 
  resource, 
  timeline, 
  onEngagementClick,
  onEmptySpaceClick 
}) => {
  const timelineStart = timeline[0]?.weeks[0]?.weekStart;
  const timelineEnd = timeline[timeline.length - 1]?.weeks[timeline[timeline.length - 1].weeks.length - 1]?.weekEnd;
  
  // Calculate total weeks for percentage calculation
  const totalWeeks = timeline.reduce((acc, month) => acc + month.weeks.length, 0);

  const { trackAssignments, maxTracks, rowHeight } = useMemo(() => {
    if (!resource.engagements.length) {
      return { trackAssignments: new Map(), maxTracks: 1, rowHeight: 48 };
    }

    const assignments = assignEngagementTracks(resource.engagements);
    const tracks = calculateMaxTracks(resource.engagements);
    const trackHeight = 22; // Height per track
    const trackSpacing = 2; // Gap between tracks
    const padding = 8; // Top and bottom padding
    const extraCells = 2; // Number of extra cells of height to add
    const minTracks = 2; // Minimum number of tracks/cells to show
    
    // Calculate base height based on tracks
    const baseHeight = (tracks * trackHeight) + ((tracks - 1) * trackSpacing) + padding;
    
    // Calculate height based on number of engagements + extra cells
    const engagementCount = resource.engagements.length;
    const cellHeight = trackHeight + trackSpacing;
    const engagementBasedHeight = (Math.max(engagementCount, minTracks) + extraCells) * cellHeight + padding;
    
    // Use the larger of the two heights to ensure everything fits
    const calculatedHeight = Math.max(
      (minTracks * trackHeight) + ((minTracks - 1) * trackSpacing) + padding, // Minimum 4 tracks height
      baseHeight, 
      engagementBasedHeight
    );
    
    return { 
      trackAssignments: assignments, 
      maxTracks: tracks, 
      rowHeight: calculatedHeight 
    };
  }, [resource.engagements]);

  if (!timelineStart || !timelineEnd) return null;

  return (
    <div 
      className="flex border-b hover:bg-muted/50 transition-colors"
      style={{ height: `${rowHeight}px` }}
    >
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
      <div className="flex-1 relative">
        {/* Week grid background */}
        <div className="absolute inset-0 flex">
          {timeline.map((month, monthIndex) =>
            month.weeks.map((week, weekIndex) => {
              const isCurrentWeek = week.isCurrentWeek;
              const weekPercentage = 100 / totalWeeks;
              const globalWeekIndex = timeline
                .slice(0, monthIndex)
                .reduce((acc, m) => acc + m.weeks.length, 0) + weekIndex;
              
              const handleEmptyClick = () => {
                if (onEmptySpaceClick) {
                  const clickedDate = calculateClickedDate(globalWeekIndex, timeline);
                  onEmptySpaceClick(resource.profile.id, clickedDate);
                }
              };
              
              return (
                <div
                  key={`${monthIndex}-${weekIndex}`}
                  className={`border-r border-border/20 cursor-pointer hover:bg-muted/20 transition-colors ${isCurrentWeek ? 'bg-primary/5' : ''}`}
                  style={{ width: `${weekPercentage}%` }}
                  onClick={handleEmptyClick}
                />
              );
            })
          )}
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