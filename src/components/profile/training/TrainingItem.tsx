
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import { Training } from '@/types';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface TrainingItemProps {
  training: Training;
  isEditing: boolean;
  onEdit: (training: Training) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const TrainingItem: React.FC<TrainingItemProps> = ({
  training,
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
      title: 'Delete Training',
      description: 'Are you sure you want to delete this training? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await onDelete(training.id);
      }
    });
  };

  const isExpired = training.expiryDate && new Date(training.expiryDate) < new Date();
  const isExpiringSoon = training.expiryDate && 
    new Date(training.expiryDate) > new Date() && 
    new Date(training.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return (
    <>
      <div className="border rounded-md p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{training.title}</h3>
              {training.isRenewable && (
                <Badge variant="outline" className="text-xs">
                  Renewable
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Expired
                </Badge>
              )}
              {isExpiringSoon && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires Soon
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{training.provider}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Certified: {format(training.date, 'PPP')}
            </div>
            {training.expiryDate && (
              <div className={`text-sm mt-1 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                Expires: {format(training.expiryDate, 'PPP')}
              </div>
            )}
          </div>
          {training.certificateUrl && (
            <a 
              href={training.certificateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cvsite-teal flex items-center text-sm hover:underline"
            >
              View Certificate <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
        
        {training.description && (
          <p className="text-sm text-muted-foreground mt-3">{training.description}</p>
        )}
        
        {isEditing && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(training)}
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
