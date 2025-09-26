import React from 'react';
import { GanttEngagement, GanttEngagementPosition } from './types';
import { formatEngagementTooltip } from './utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { useResourceCalendarPermissions } from '@/hooks/use-resource-permissions';

interface GanttCellProps {
  engagement: GanttEngagement;
  position: GanttEngagementPosition;
  onEngagementClick?: (engagement: GanttEngagement) => void;
  onDuplicateClick?: (engagement: GanttEngagement) => void;
}

export const GanttCell: React.FC<GanttCellProps> = ({
  engagement,
  position,
  onEngagementClick,
  onDuplicateClick
}) => {
  const permissions = useResourceCalendarPermissions();
  const handleClick = () => {
    onEngagementClick?.(engagement);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateClick?.(engagement);
  };

  const backgroundColor = engagement.bill_type?.color_code || '#6b7280';
  
  // Calculate if background is light or dark for better text contrast
  const isLightBackground = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const isLight = isLightBackground(backgroundColor);
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const secondaryTextColor = isLight ? 'text-gray-700' : 'text-gray-200';

  const trackSpacing = 2;
  const topPosition = 4 + (position.track * (position.trackHeight + trackSpacing));

  // Determine layout based on cell width - show more info for wider cells
  const cellWidth = position.width;
  const isWideCell = cellWidth > 15; // Show more details for cells wider than 15%
  const isMediumCell = cellWidth > 8;  // Show basic info for medium cells

  return (
    <div
      className={cn(
        "absolute rounded-sm cursor-pointer transition-all duration-200 group",
        "border border-black/10 hover:border-black/20",
        isLight ? "shadow-sm" : "shadow-md"
      )}
      style={{
        left: `${position.left}%`,
        width: `${position.width}%`,
        height: `${position.trackHeight}px`,
        backgroundColor,
        top: `${topPosition}px`
      }}
      onClick={permissions.canEditProject ? handleClick : undefined}
      title={formatEngagementTooltip(engagement)}
    >
      <div className="h-full flex items-center px-2 py-1">
        {/* Duplicate button - shows on hover */}
        {permissions.showDuplicateProjectButton && onDuplicateClick && (
          <button
            onClick={handleDuplicateClick}
            className={cn(
              "absolute right-1 p-1 rounded-sm transition-all duration-200 opacity-0 group-hover:opacity-100",
              "hover:scale-110 z-10 -translate-y-1/2",
              isLight ? "bg-white/80 text-gray-700 hover:bg-white" : "bg-black/80 text-white hover:bg-black/90"
            )}
            style={{ top: '50%' }}
            title="Duplicate assignment"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
       
        {isMediumCell ? (
          <div className="flex-1 min-w-0">
            <div className={cn("flex items-center gap-1.5 w-full", textColor)}>
              {/* Project name - primary info */}
              <span className="text-xs font-medium truncate">
                {engagement.project_name || 'Untitled Project'}
              </span>
              
              {/* Badges next to project name in wide cells */}
              {isWideCell && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {engagement.project?.project_level && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1 py-0 h-4 border-current/20",
                        isLight ? "bg-white/50 text-gray-700" : "bg-black/20 text-gray-200"
                      )}
                    >
                      {engagement.project.project_level}
                    </Badge>
                  )}
                  {engagement.project?.project_bill_type && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1 py-0 h-4 border-current/20",
                        isLight ? "bg-white/50 text-gray-700" : "bg-black/20 text-gray-200"
                      )}
                    >
                      {engagement.project.project_bill_type}
                    </Badge>
                  )}
                  {engagement.project?.project_type_name && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1 py-0 h-4 border-current/20",
                        isLight ? "bg-white/50 text-gray-700" : "bg-black/20 text-gray-200"
                      )}
                    >
                      {engagement.project.project_type_name}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Engagement percentage - always visible on the right */}
              <span className={cn("text-xs font-bold ml-auto shrink-0", secondaryTextColor)}>
                {engagement.engagement_percentage}%
              </span>
            </div>
          </div>
        ) : (
          // Compact view for narrow cells - just percentage
          <div className={cn("flex items-center justify-center w-full", textColor)}>
            <span className="text-xs font-bold">
              {engagement.engagement_percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};