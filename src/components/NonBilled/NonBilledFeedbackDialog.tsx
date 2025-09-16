import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NonBilledFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  initialFeedback: string;
  onSave: (feedback: string) => Promise<void>;
}

export const NonBilledFeedbackDialog: React.FC<NonBilledFeedbackDialogProps> = ({
  isOpen,
  onClose,
  employeeName,
  initialFeedback,
  onSave,
}) => {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFeedback(initialFeedback);
    setHasChanges(false);
  }, [initialFeedback, isOpen]);

  useEffect(() => {
    setHasChanges(feedback !== initialFeedback);
  }, [feedback, initialFeedback]);

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(feedback.trim());
    } catch (error) {
      console.error('Failed to save feedback:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bench Feedback</DialogTitle>
          <DialogDescription>
            Add or update feedback for {employeeName}'s bench status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Enter feedback about the bench status, skills, availability, etc."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {feedback.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};