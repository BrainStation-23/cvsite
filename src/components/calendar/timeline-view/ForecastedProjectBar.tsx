
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Edit, Trash2, GripHorizontal } from 'lucide-react';

interface ForecastedProject {
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface ForecastedProjectBarProps {
  project: ForecastedProject;
  month: Date;
  index: number;
  colorCode: string;
  resourceId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

export const ForecastedProjectBar: React.FC<ForecastedProjectBarProps> = ({
  project,
  month,
  index,
  colorCode,
  resourceId,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dragId = `forecasted-${resourceId}-${index}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      type: 'forecasted-project',
      project,
      resourceId,
      index,
    },
  });

  const getProjectBarStyle = (project: ForecastedProject, month: Date) => {
    if (!project.startDate) return null;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const projectStart = new Date(project.startDate);
    const projectEnd = project.endDate ? new Date(project.endDate) : new Date('2099-12-31');
    
    const overlaps = isWithinInterval(monthStart, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(monthEnd, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(projectStart, { start: monthStart, end: monthEnd }) ||
                    isWithinInterval(projectEnd, { start: monthStart, end: monthEnd });
    
    if (!overlaps) return null;
    
    const startPos = projectStart <= monthStart ? 0 : 
      ((projectStart.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const endPos = projectEnd >= monthEnd ? 100 :
      ((projectEnd.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const width = endPos - startPos;
    
    return {
      left: `${startPos}%`,
      width: `${width}%`,
    };
  };

  const barStyle = getProjectBarStyle(project, month);
  if (!barStyle) return null;

  return (
    <TooltipProvider>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                ref={setNodeRef}
                className={`absolute rounded text-xs text-white flex items-center justify-between overflow-hidden shadow-sm cursor-pointer transition-all duration-200 border-2 border-dashed ${
                  isSelected ? 'ring-2 ring-white shadow-lg' : ''
                } ${
                  isHovered ? 'shadow-lg scale-105 z-10' : ''
                } ${
                  isDragging ? 'opacity-50' : ''
                }`}
                style={{
                  ...barStyle,
                  backgroundColor: `${colorCode}E6`, // Slightly transparent for forecasted
                  borderColor: colorCode,
                  top: `${index * 30}px`,
                  height: '24px',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.ctrlKey || e.metaKey) {
                    onSelect();
                  } else {
                    onEdit();
                  }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                {...attributes}
              >
                <span className="truncate px-2 flex-1 italic">{project.name}</span>
                <div 
                  className="px-1 hover:bg-black/20 rounded cursor-grab active:cursor-grabbing"
                  {...listeners}
                >
                  <GripHorizontal className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-medium">{project.name} (Forecasted)</div>
                <div>Engagement: {project.engagementPercentage}%</div>
                <div>Start: {project.startDate}</div>
                {project.endDate && <div>End: {project.endDate}</div>}
                <div className="text-muted-foreground mt-1">
                  Click to edit • Ctrl+Click to select • Right-click for options
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Forecast
          </ContextMenuItem>
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate to Next Month
          </ContextMenuItem>
          <ContextMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Forecast
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  );
};
