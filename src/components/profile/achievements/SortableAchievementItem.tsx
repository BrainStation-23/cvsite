
import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Achievement } from '@/types';
import { AchievementItem } from './AchievementItem';

interface SortableAchievementItemProps {
  achievement: Achievement;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: (id: string) => Promise<boolean>;
  editingId: string | null;
}

export const SortableAchievementItem: React.FC<SortableAchievementItemProps> = ({
  achievement,
  isEditing,
  onEdit,
  onDelete,
  editingId
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: achievement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyEditing = editingId === achievement.id;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="border rounded-md p-4 bg-white dark:bg-gray-800"
    >
      <div className="flex items-start">
        {isEditing && !isCurrentlyEditing && (
          <div 
            {...attributes} 
            {...listeners}
            className="flex items-center cursor-grab active:cursor-grabbing mr-3 mt-1"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <AchievementItem
            achievement={achievement}
            isEditing={isEditing}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
