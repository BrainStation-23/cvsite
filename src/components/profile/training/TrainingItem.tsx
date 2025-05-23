
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Training } from '@/types';

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
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      await onDelete(training.id);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{training.title}</h3>
          <div className="text-sm text-muted-foreground">{training.provider}</div>
          <div className="text-sm text-muted-foreground mt-1">{format(training.date, 'PPP')}</div>
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
  );
};
