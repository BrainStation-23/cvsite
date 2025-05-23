
import React from 'react';
import { Training } from '@/types';
import { TrainingItem } from './TrainingItem';

interface TrainingListProps {
  trainings: Training[];
  isEditing: boolean;
  onEdit: (training: Training) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const TrainingList: React.FC<TrainingListProps> = ({
  trainings,
  isEditing,
  onEdit,
  onDelete
}) => {
  const handleDelete = async (id: string) => {
    return await onDelete(id);
  };

  if (trainings.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No training or certifications added yet. 
        {isEditing && ' Click "Add Training" to add your certifications.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trainings.map((training) => (
        <TrainingItem
          key={training.id}
          training={training}
          isEditing={isEditing}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
