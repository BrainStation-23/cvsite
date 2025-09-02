
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { Lock, Info, Trash2 } from 'lucide-react';

interface ActualProject {
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface ActualProjectBarProps {
  project: ActualProject;
  month: Date;
  index: number;
  colorCode: string;
  resourceId: string;
  onDelete?: () => void;
}

export const ActualProjectBar: React.FC<ActualProjectBarProps> = ({
  project,
  month,
  index,
  colorCode,
  resourceId,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      showConfirmation({
        title: 'Delete Assignment',
        description: `Are you sure you want to delete the assignment "${project.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm: onDelete,
      });
    }
  };

  const getProjectBarStyle = (project: ActualProject, month: Date) => {
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
              className={`absolute rounded text-xs text-white flex items-center justify-between overflow-hidden shadow-sm cursor-pointer transition-all duration-200 group ${
                isHovered ? 'shadow-md' : ''
              }`}
              style={{
                ...barStyle,
                backgroundColor: `${colorCode}`,
                top: `${index * 30}px`,
                height: '24px',
                fontSize: '10px',
                fontWeight: '400',
                opacity: 1
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="truncate px-2 flex-1">{project.name}</span>
              <div className="flex items-center px-1">
                <Lock className="h-3 w-3 opacity-60 mr-1" />
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 rounded p-0.5"
                    title="Delete Assignment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium flex items-center gap-1">
                <Info className="h-3 w-3" />
                {project.name} (Actual)
              </div>
              <div>Engagement: {project.engagementPercentage}%</div>
              <div>Start: {project.startDate}</div>
              {project.endDate && <div>End: {project.endDate}</div>}
              {onDelete && (
                <div className="text-muted-foreground mt-1">
                  Hover to see delete button
                </div>
              )}
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
