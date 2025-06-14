
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Skill } from '@/types';
import { SkillCard } from './SkillCard';

interface SkillListProps {
  skills: Skill[];
  isEditing: boolean;
  isDraggable?: boolean;
  onUpdateSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
  onReorderSkills?: (reorderedSkills: Skill[]) => void;
  title: string;
  skillType?: 'technical' | 'specialized';
}

export const SkillList: React.FC<SkillListProps> = ({
  skills,
  isEditing,
  isDraggable = false,
  onUpdateSkill,
  onDeleteSkill,
  onReorderSkills,
  title,
  skillType = 'specialized'
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderSkills) {
      const oldIndex = skills.findIndex(skill => skill.id === active.id);
      const newIndex = skills.findIndex(skill => skill.id === over.id);
      
      const reorderedSkills = arrayMove(skills, oldIndex, newIndex);
      onReorderSkills(reorderedSkills);
    }
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No {title.toLowerCase()} added yet.</p>
        {isEditing && (
          <p className="text-xs mt-1">Use the button above to add your first skill.</p>
        )}
      </div>
    );
  }

  const skillList = (
    <div className="space-y-2">
      {skills.map((skill, index) => (
        <div 
          key={skill.id} 
          data-tour={index === 0 ? "skill-item" : undefined}
        >
          <SkillCard
            skill={skill}
            isEditing={isEditing}
            isDraggable={isDraggable}
            onUpdate={onUpdateSkill}
            onDelete={onDeleteSkill}
            skillType={skillType}
          />
        </div>
      ))}
    </div>
  );

  if (!isDraggable || !isEditing) {
    return skillList;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={skills.map(skill => skill.id)} strategy={verticalListSortingStrategy}>
        {skillList}
      </SortableContext>
    </DndContext>
  );
};
