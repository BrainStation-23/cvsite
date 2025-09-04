import React from 'react';
import { GanttEngagement } from './types';
import { formatEngagementTooltip } from './utils';

interface GanttCellProps {
  engagement: GanttEngagement;
  position: { left: number; width: number };
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

  return (
    <div
      className="absolute h-6 rounded-sm border border-white/20 cursor-pointer hover:border-white/40 transition-all duration-200 hover:scale-105 group"
      style={{
        left: `${position.left}%`,
        width: `${position.width}%`,
        backgroundColor,
        opacity: opacity * 0.8 + 0.2, // Minimum 20% opacity
        top: '2px'
      }}
      onClick={handleClick}
      title={formatEngagementTooltip(engagement)}
    >
      <div className="h-full flex items-center justify-center">
        <span className="text-xs text-white font-medium truncate px-1">
          {engagement.project_name} [{engagement.engagement_percentage}%]
        </span>
      </div>
    </div>
  );
};