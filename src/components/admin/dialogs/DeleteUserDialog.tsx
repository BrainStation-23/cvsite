
import React from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { UserData } from '@/hooks/use-user-management';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onDeleteUser: (userId: string) => Promise<boolean>;
  isDeleting: boolean;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onDeleteUser,
  isDeleting
}) => {
  const handleDelete = async () => {
    if (!user) return;
    
    const success = await onDeleteUser(user.id);
    if (success) {
      onOpenChange(false);
    }
  };
  
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      onConfirm={handleDelete}
      title="Are you sure you want to delete this user?"
      description={`This action cannot be undone. This will permanently delete the user account for ${user?.firstName} ${user?.lastName}.`}
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      cancelText="Cancel"
      variant="destructive"
    />
  );
};
