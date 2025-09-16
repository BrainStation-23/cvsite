import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit3 } from 'lucide-react';
import { NonBilledFeedbackDialog } from './NonBilledFeedbackDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NonBilledFeedbackCellProps {
  employeeId: string;
  employeeName: string;
  feedback: string | null;
  onUpdate: (employeeId: string, feedback: string) => Promise<void>;
}

export const NonBilledFeedbackCell: React.FC<NonBilledFeedbackCellProps> = ({
  employeeId,
  employeeName,
  feedback,
  onUpdate,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const truncatedFeedback = feedback && feedback.length > 50 
    ? `${feedback.substring(0, 50)}...` 
    : feedback;

  const handleUpdate = async (newFeedback: string) => {
    await onUpdate(employeeId, newFeedback);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 max-w-[180px]">
        {feedback ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 text-sm text-muted-foreground cursor-help truncate">
                  <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                  <span className="align-middle">{truncatedFeedback}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{feedback}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex-1 text-sm text-muted-foreground opacity-70">
            <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5 opacity-70" />
            <span className="align-middle">No feedback</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 ml-1"
          onClick={() => setIsDialogOpen(true)}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <NonBilledFeedbackDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employeeName={employeeName}
        initialFeedback={feedback || ''}
        onSave={handleUpdate}
      />
    </>
  );
};