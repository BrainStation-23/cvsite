import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit3 } from 'lucide-react';
import { BenchFeedbackDialog } from './BenchFeedbackDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BenchFeedbackCellProps {
  employeeId: string;
  employeeName: string;
  feedback: string | null;
  onUpdate: (employeeId: string, feedback: string) => Promise<void>;
}

export const BenchFeedbackCell: React.FC<BenchFeedbackCellProps> = ({
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
      <div className="flex items-center gap-2 max-w-[200px]">
        {feedback ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 text-sm text-muted-foreground cursor-help">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  {truncatedFeedback}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{feedback}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 inline mr-1 opacity-50" />
            No feedback
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>

      <BenchFeedbackDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employeeName={employeeName}
        initialFeedback={feedback || ''}
        onSave={handleUpdate}
      />
    </>
  );
};