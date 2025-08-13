
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Training } from '@/types';
import { TrainingForm } from './TrainingForm';
import { TrainingList } from './TrainingList';
import { TrainingTourButton } from './TrainingTourButton';

interface TrainingTabProps {
  trainings: Training[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (training: Omit<Training, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, training: Partial<Training>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({
  trainings,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartAddNew = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Training, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
    return success;
  };

  const handleStartEdit = (training: Training) => {
    setEditingId(training.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Training, 'id'>) => {
    if (!editingId) return false;
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
    return success;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Training & Certifications</CardTitle>
            <TrainingTourButton />
          </div>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew} data-tour="add-training-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Training
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <TrainingForm
              onSave={handleSaveNew}
              onCancel={handleCancelAdd}
              isSaving={isSaving}
            />
          </div>
        )}
        
        {editingId && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <TrainingForm
              initialData={trainings.find(t => t.id === editingId)}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
            />
          </div>
        )}
        
        <TrainingList
          trainings={trainings}
          isEditing={isEditing}
          onEdit={handleStartEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};
