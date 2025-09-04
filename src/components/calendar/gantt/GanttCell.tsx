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

  const opacity = Math.min(engagement.engagement_percentage / 100, 1);
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
          {engagement.project_name}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-popover text-popover-foreground text-xs p-3 rounded-lg shadow-lg border max-w-xs whitespace-pre-line">
          {formatEngagementTooltip(engagement)}
        </div>
      </div>
    </div>
  );
};