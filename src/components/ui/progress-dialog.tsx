
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  progress: number;
  allowCancel?: boolean;
}

export const ProgressDialog: React.FC<ProgressDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  progress,
  allowCancel = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={allowCancel ? onClose : undefined}>
      <DialogContent className="sm:max-w-md" hideCloseButton={!allowCancel}>
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">{progress}%</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
