
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Training } from '@/types';
import { TrainingForm } from './TrainingForm';
import { TrainingList } from './TrainingList';
import { TrainingTourButton } from './TrainingTourButton';

interface TrainingTabProps {
  training: Training[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (training: Omit<Training, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, training: Partial<Training>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({
  training,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  const handleStartAddNew = () => {
    setIsAdding(true);
    setEditingTraining(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleStartEdit = (training: Training) => {
    setEditingTraining(training);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingTraining(null);
  };

  const handleSaveNew = async (data: Omit<Training, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
    return success;
  };

  const handleSaveEdit = async (data: Omit<Training, 'id'>) => {
    if (!editingTraining) return false;
    
    const success = await onUpdate(editingTraining.id, data);
    if (success) {
      setEditingTraining(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  const showForm = isAdding || editingTraining;
  const showAddButton = isEditing && !showForm;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Training & Certifications</CardTitle>
            <TrainingTourButton />
          </div>
          {showAddButton && (
            <Button variant="outline" onClick={handleStartAddNew} data-tour="add-training-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Training
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6">
            <TrainingForm
              initialData={editingTraining || undefined}
              isSaving={isSaving}
              onSave={editingTraining ? handleSaveEdit : handleSaveNew}
              onCancel={editingTraining ? handleCancelEdit : handleCancelAdd}
            />
          </div>
        )}
        
        <TrainingList
          training={training}
          isEditing={isEditing}
          onEdit={handleStartEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};
