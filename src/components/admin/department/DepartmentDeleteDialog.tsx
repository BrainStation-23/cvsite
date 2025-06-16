
import React from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface DepartmentDeleteDialogProps {
  isOpen: boolean;
  departmentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DepartmentDeleteDialog: React.FC<DepartmentDeleteDialogProps> = ({
  isOpen,
  departmentName,
  onConfirm,
  onCancel
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete Department"
      description={`Are you sure you want to delete "${departmentName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  );
};

export default DepartmentDeleteDialog;
