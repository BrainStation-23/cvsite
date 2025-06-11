
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
  const [optimisticSkills, setOptimisticSkills] = useState<Skill[]>(skills);

  // Update local skills when props change, but preserve optimistic state during drag
  useEffect(() => {
    if (!activeId) {
      setLocalSkills(skills);
      setOptimisticSkills(skills);
    } else {
      // Only update local skills during drag, not optimistic
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onReorderSkills) {
      const oldIndex = optimisticSkills.findIndex((skill) => skill.id === active.id);
      const newIndex = optimisticSkills.findIndex((skill) => skill.id === over.id);

      // Create the optimistically reordered array
      const reorderedSkills = arrayMove(optimisticSkills, oldIndex, newIndex);
      
      // Update optimistic state immediately for smooth UX
      setOptimisticSkills(reorderedSkills);

      // Attempt database update
      try {
        await onReorderSkills(reorderedSkills);
        // If successful, the parent will update and useEffect will sync localSkills
      } catch (error) {
        // If failed, revert optimistic state to original
        console.error('Failed to reorder skills:', error);
        setOptimisticSkills(localSkills);
      }
    }
    
    setActiveId(null);
  };

  const activeSkill = activeId ? optimisticSkills.find(skill => skill.id === activeId) : null;

  // Use optimistic skills for rendering during drag operations
  const displaySkills = activeId ? optimisticSkills : localSkills;

  if (displaySkills.length === 0) {
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
            items={displaySkills.map(skill => skill.id)} 
            strategy={verticalListSortingStrategy}
          >
            {displaySkills.map((skill) => (
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
        displaySkills.map((skill) => (
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
