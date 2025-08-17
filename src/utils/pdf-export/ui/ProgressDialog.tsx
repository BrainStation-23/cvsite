
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

export interface ProgressStep {
  id: string;
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

interface ProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: ProgressStep[];
  progress: number;
  allowCancel?: boolean;
}

export const ProgressDialog: React.FC<ProgressDialogProps> = ({
  isOpen,
  onClose,
  title,
  steps,
  progress,
  allowCancel = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={allowCancel ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            {allowCancel && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {step.isComplete ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      step.isActive ? 'border-primary bg-primary/10' : 'border-muted-foreground'
                    }`} />
                  )}
                </div>
                <span className={`text-sm ${
                  step.isComplete ? 'text-green-600' : 
                  step.isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
