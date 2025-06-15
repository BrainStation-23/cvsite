
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Achievement } from '@/types';
import { AchievementForm } from './achievements/AchievementForm';
import { AchievementsList } from './achievements/AchievementsList';

interface AchievementsTabProps {
  achievements: Achievement[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addForm = useForm<Omit<Achievement, 'id'>>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date()
    }
  });

  const editForm = useForm<Omit<Achievement, 'id'>>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date()
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setDate(new Date());
    addForm.reset({
      title: '',
      description: '',
      date: new Date()
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Achievement, 'id'>) => {
    data.date = date || new Date();
    
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setDate(achievement.date);
    
    editForm.reset({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Achievement, 'id'>) => {
    if (!editingId) return;
    
    data.date = date || new Date();
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Achievements</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <AchievementForm
              form={addForm}
              onSubmit={handleSaveNew}
              onCancel={handleCancelAdd}
              date={date}
              setDate={setDate}
              isSaving={isSaving}
              title="Add New Achievement"
              submitButtonText="Save Achievement"
            />
          </div>
        )}
        
        {editingId && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <AchievementForm
              form={editForm}
              onSubmit={handleSaveEdit}
              onCancel={handleCancelEdit}
              date={date}
              setDate={setDate}
              isSaving={isSaving}
              title="Edit Achievement"
              submitButtonText="Save Changes"
            />
          </div>
        )}
        
        <AchievementsList
          achievements={achievements}
          isEditing={isEditing}
          onEdit={handleStartEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};
