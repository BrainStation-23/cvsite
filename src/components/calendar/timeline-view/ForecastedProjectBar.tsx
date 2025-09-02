
import React, { useState, useCallback } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { Copy, Edit, Trash2 } from 'lucide-react';

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
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  // Use useCallback for better performance
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      onSelect();
    } else {
      onEdit();
    }
  }, [onSelect, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirmation({
      title: 'Delete Forecast',
      description: `Are you sure you want to delete the forecast "${project.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: onDelete,
    });
  }, [onDelete, project.name, showConfirmation]);

  const handleDuplicateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  }, [onDuplicate]);

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
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute rounded text-xs text-white flex items-center justify-between overflow-hidden shadow-sm cursor-pointer transition-all duration-200 border-2 border-dashed group ${
                isSelected ? 'ring-2 ring-white shadow-lg' : ''
              } ${
                isHovered ? 'shadow-lg scale-105' : ''
              }`}
              style={{
                ...barStyle,
                backgroundColor: `${colorCode}E6`, // Slightly transparent for forecasted
                borderColor: colorCode,
                top: `${index * 30}px`,
                height: '24px',
                fontSize: '10px',
                fontWeight: '500',
                zIndex: 20 // Higher z-index for project bars
              }}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="truncate px-2 flex-1 italic">{project.name}</span>
              <div className="flex items-center px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleDuplicateClick}
                  className="hover:bg-blue-500 rounded p-0.5 mr-1"
                  title="Duplicate to Next Month"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="hover:bg-red-500 rounded p-0.5"
                  title="Delete Forecast"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
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
                Click to edit • Ctrl+Click to select • Hover for actions
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
