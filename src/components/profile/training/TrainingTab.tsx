import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Training } from '@/types';
import { TrainingForm } from './TrainingForm';
import { TrainingsList } from './TrainingsList';
import { TrainingsTourButton } from './TrainingsTourButton';
import { formatDateToString, parseStringToDate } from '@/utils/date-helpers';

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
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addForm = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: '',
      provider: '',
      description: '',
      date: formatDateToString(new Date()),
      certificateUrl: ''
    }
  });

  const editForm = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: '',
      provider: '',
      description: '',
      date: formatDateToString(new Date()),
      certificateUrl: ''
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setDate(new Date());
    addForm.reset({
      title: '',
      provider: '',
      description: '',
      date: formatDateToString(new Date()),
      certificateUrl: ''
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Training, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (training: Training) => {
    setEditingId(training.id);
    setDate(parseStringToDate(training.date));
    
    editForm.reset({
      title: training.title,
      provider: training.provider,
      description: training.description || '',
      date: training.date,
      certificateUrl: training.certificateUrl || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Training, 'id'>) => {
    if (!editingId) return;
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Training & Certification</CardTitle>
            <TrainingsTourButton />
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
              initialData={addForm.getValues()}
              form={addForm}
              isSaving={isSaving}
              onSave={handleSaveNew}
              onCancel={handleCancelAdd}
            />
          </div>
        )}
        
        {editingId && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <TrainingForm
              initialData={trainings.find(training => training.id === editingId)}
              form={editForm}
              isSaving={isSaving}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        <TrainingsList
          trainings={trainings}
          isEditing={isEditing}
          onEdit={handleStartEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};
