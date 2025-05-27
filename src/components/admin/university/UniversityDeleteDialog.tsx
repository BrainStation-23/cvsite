
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UniversityDeleteDialogProps {
  isOpen: boolean;
  universityName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const UniversityDeleteDialog: React.FC<UniversityDeleteDialogProps> = ({
  isOpen,
  universityName,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete University</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{universityName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UniversityDeleteDialog;
