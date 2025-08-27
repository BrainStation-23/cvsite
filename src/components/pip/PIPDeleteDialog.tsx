
import React from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PIP } from '@/types/pip';

interface PIPDeleteDialogProps {
  isOpen: boolean;
  pip: PIP | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const PIPDeleteDialog: React.FC<PIPDeleteDialogProps> = ({
  isOpen,
  pip,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  if (!pip) return null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete Performance Improvement Plan"
      description={`Are you sure you want to delete the PIP for ${pip.employee_name}? This action cannot be undone.`}
      confirmText={isDeleting ? "Deleting..." : "Delete PIP"}
      cancelText="Cancel"
      variant="destructive"
    />
  );
};
