
import React, { useState, useEffect } from 'react';
import { Skill } from '@/types';
import { SkillCard } from './SkillCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);

  // Update local skills when props change, but only if we're not currently dragging
  useEffect(() => {
    if (!activeId) {
      setLocalSkills(skills);
    }
  }, [skills, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onReorderSkills) {
      const oldIndex = localSkills.findIndex((skill) => skill.id === active.id);
      const newIndex = localSkills.findIndex((skill) => skill.id === over.id);

      const reorderedSkills = arrayMove(localSkills, oldIndex, newIndex);
      
      // Update local state immediately for smooth animation
      setLocalSkills(reorderedSkills);

      // Then update the database
      onReorderSkills(reorderedSkills);
    }
    
    setActiveId(null);
  };

  const activeSkill = activeId ? localSkills.find(skill => skill.id === activeId) : null;

  if (localSkills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No {title.toLowerCase()} added yet.</p>
        {isEditing && (
          <p className="text-sm mt-1">Click "Add Skill" to get started.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isDraggable && isEditing ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext 
            items={localSkills.map(skill => skill.id)} 
            strategy={verticalListSortingStrategy}
          >
            {localSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isEditing={isEditing}
                isDraggable={isDraggable}
                onUpdate={onUpdateSkill}
                onDelete={onDeleteSkill}
                skillType={skillType}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeSkill ? (
              <SkillCard
                skill={activeSkill}
                isEditing={isEditing}
                isDraggable={false}
                onUpdate={onUpdateSkill}
                onDelete={onDeleteSkill}
                skillType={skillType}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        localSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isEditing={isEditing}
            isDraggable={false}
            onUpdate={onUpdateSkill}
            onDelete={onDeleteSkill}
            skillType={skillType}
          />
        ))
      )}
    </div>
  );
};
