import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Achievement } from '@/types';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface AchievementItemProps {
  achievement: Achievement;
  isEditing: boolean;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  isEditing,
  onEdit,
  onDelete
}) => {
  const {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  } = useConfirmationDialog();

  const handleDelete = () => {
    showConfirmation({
      title: 'Delete Achievement',
      description: 'Are you sure you want to delete this achievement? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await onDelete(achievement.id);
      }
    });
  };

  return (
    <>
      <div className="border rounded-md p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{achievement.title}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              {format(achievement.date, 'PPP')}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-3">{achievement.description}</p>
        
        {isEditing && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(achievement)}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
