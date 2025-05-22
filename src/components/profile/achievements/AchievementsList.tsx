
import React from 'react';
import { Achievement } from '@/types';
import { AchievementItem } from './AchievementItem';

interface AchievementsListProps {
  achievements: Achievement[];
  isEditing: boolean;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  isEditing,
  onEdit,
  onDelete
}) => {
  if (achievements.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No achievements added yet. 
        {isEditing && ' Click "Add Achievement" to add your professional accomplishments.'}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <AchievementItem
          key={achievement.id}
          achievement={achievement}
          isEditing={isEditing}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
