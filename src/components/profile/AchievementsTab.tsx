
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Achievement } from '@/types';
import { AchievementForm } from './achievements/AchievementForm';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableAchievementItem } from './achievements/SortableAchievementItem';

interface AchievementsTabProps {
  achievements: Achievement[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder?: (achievements: Achievement[]) => Promise<boolean>;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete,
  onReorder
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && onReorder) {
      const oldIndex = achievements.findIndex(item => item.id === active.id);
      const newIndex = achievements.findIndex(item => item.id === over.id);
      
      const reorderedAchievements = arrayMove(achievements, oldIndex, newIndex);
      onReorder(reorderedAchievements);
    }
  };

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
        
        {achievements.length > 0 ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={achievements.map(a => a.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <SortableAchievementItem
                    key={achievement.id}
                    achievement={achievement}
                    isEditing={isEditing}
                    onEdit={() => handleStartEdit(achievement)}
                    onDelete={onDelete}
                    editingId={editingId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No achievements added yet. 
            {isEditing && ' Click "Add Achievement" to add your professional accomplishments.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
