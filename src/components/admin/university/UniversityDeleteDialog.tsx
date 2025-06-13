
import React from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

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
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete University"
      description={`Are you sure you want to delete "${universityName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  );
};

export default UniversityDeleteDialog;
