
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import { Training } from '@/types';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
      <div className={`border rounded-md p-4 ${isMobile ? 'p-3' : ''}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-start'}`}>
          <div className="flex-1">
            <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-wrap' : ''}`}>
              <h3 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{training.title}</h3>
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
            <div className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>{training.provider}</div>
            <div className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : ''}`}>
              Certified: {format(training.date, isMobile ? 'MMM d, yyyy' : 'PPP')}
            </div>
            {training.expiryDate && (
              <div className={`mt-1 ${isMobile ? 'text-sm' : ''} ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                Expires: {format(training.expiryDate, isMobile ? 'MMM d, yyyy' : 'PPP')}
              </div>
            )}
          </div>
          {training.certificateUrl && (
            <a 
              href={training.certificateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-cvsite-teal flex items-center hover:underline ${isMobile ? 'text-sm self-start' : 'text-sm'}`}
            >
              View Certificate <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
        
        {training.description && (
          <p className={`text-muted-foreground mt-3 ${isMobile ? 'text-sm' : ''}`}>{training.description}</p>
        )}
        
        {isEditing && (
          <div className={`flex mt-4 ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-2'}`}>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"} 
              onClick={() => onEdit(training)}
              className={isMobile ? 'w-full' : ''}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size={isMobile ? "default" : "sm"} 
              onClick={handleDelete}
              className={isMobile ? 'w-full' : ''}
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
