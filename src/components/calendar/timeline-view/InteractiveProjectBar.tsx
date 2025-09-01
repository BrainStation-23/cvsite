
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Edit, Trash2, GripHorizontal, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface InteractiveProjectBarProps {
  project: Project;
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

export const InteractiveProjectBar: React.FC<InteractiveProjectBarProps> = ({
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dragId = `project-${resourceId}-${index}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      type: 'project',
      project,
      resourceId,
      index,
    },
  });

  const getProjectBarStyle = (project: Project, month: Date) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    switch (e.key) {
      case 'Delete':
        onDelete();
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onDuplicate();
        }
        break;
      case 'e':
      case 'Enter':
        onEdit();
        break;
      case 'Escape':
        setIsMenuOpen(false);
        break;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            className={`absolute rounded text-xs text-white flex items-center justify-between overflow-hidden shadow-sm cursor-pointer transition-all duration-200 z-20 focus:outline-none focus:ring-2 focus:ring-white ${
              isSelected ? 'ring-2 ring-white shadow-lg' : ''
            } ${
              isHovered || isMenuOpen ? 'shadow-lg scale-105 z-30' : ''
            } ${
              isDragging ? 'opacity-50 z-40' : ''
            }`}
            style={{
              ...barStyle,
              backgroundColor: colorCode,
              top: `${index * 35 + 25}px`, // Offset for empty interaction zones
              height: '28px',
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
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Project: ${project.name}. Press Enter to edit, Ctrl+Click to select, Delete to remove`}
            {...attributes}
          >
            {/* Drag Handle - Left Side */}
            <div 
              className="px-1 hover:bg-black/20 rounded cursor-grab active:cursor-grabbing flex-shrink-0"
              {...listeners}
            >
              <GripHorizontal className="h-3 w-3" />
            </div>

            {/* Project Name */}
            <span className="truncate px-2 flex-1 min-w-0">{project.name}</span>

            {/* Menu Button - Only show on hover */}
            <div className="flex-shrink-0">
              {(isHovered || isMenuOpen) && (
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-black/20 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg z-50">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); setIsMenuOpen(false); }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Assignment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); setIsMenuOpen(false); }}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(); setIsMenuOpen(false); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Resize Handles */}
            <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 transition-colors" />
            <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-background border shadow-lg">
          <div className="text-xs max-w-xs">
            <div className="font-medium">{project.name}</div>
            <div>Engagement: {project.engagementPercentage}%</div>
            <div>Start: {project.startDate}</div>
            {project.endDate && <div>End: {project.endDate}</div>}
            <div className="text-muted-foreground mt-1">
              Double-click or Enter to edit • Ctrl+Click to select • Delete to remove
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
