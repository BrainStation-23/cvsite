import React from 'react';
import { GanttEngagement, GanttEngagementPosition } from './types';
import { formatEngagementTooltip } from './utils';
import { Badge } from '@/components/ui/badge';

interface GanttCellProps {
  engagement: GanttEngagement;
  position: GanttEngagementPosition;
  onEngagementClick?: (engagement: GanttEngagement) => void;
}

export const GanttCell: React.FC<GanttCellProps> = ({
  engagement,
  position,
  onEngagementClick
}) => {
  const handleClick = () => {
    onEngagementClick?.(engagement);
  };

  const opacity = 1;
  const backgroundColor = engagement.bill_type?.color_code || '#6b7280';

  const trackSpacing = 2;
  const topPosition = 4 + (position.track * (position.trackHeight + trackSpacing));

  return (
    <div
      className="absolute rounded-sm border border-white/20 cursor-pointer hover:border-white/40 transition-all duration-200 group"
      style={{
        left: `${position.left}%`,
        width: `${position.width}%`,
        height: `${position.trackHeight}px`,
        backgroundColor,
        opacity: opacity * 0.8 + 0.2, // Minimum 20% opacity
        top: `${topPosition}px`
      }}
      onClick={handleClick}
      title={formatEngagementTooltip(engagement)}
    >
      <div className="h-full flex items-center justify-center">
        <span className="text-xs text-white font-medium truncate px-1 flex items-center gap-1">

          {engagement.project?.project_bill_type && (
            <Badge variant="default" className="text-[10px] py-0">
              {engagement.project.project_bill_type}
            </Badge>
          )}
          {engagement.project?.project_level && (
            <Badge variant="default" className="text-[10px] py-0">
              {engagement.project.project_level}
            </Badge>
          )}
          {engagement.project?.project_type_name && (
            <Badge variant="default" className="text-[10px] py-0">
              {engagement.project.project_type_name}
            </Badge>
          )}
          {engagement.project_name}
          {engagement.engagement_percentage > 0 && (
            <span className="ml-1 text-white/80">[{engagement.engagement_percentage}%]</span>
          )}
        </span>
      </div>
    </div>
  );
};