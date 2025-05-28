
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
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

interface SkillSectionProps {
  title: string;
  skills: Skill[];
  isEditing: boolean;
  isDraggable?: boolean;
  newSkill: Omit<Skill, 'id'>;
  setNewSkill: (skill: Omit<Skill, 'id'>) => void;
  onAddSkill: () => void;
  onUpdateSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
  onReorderSkills?: (reorderedSkills: Skill[]) => void;
}

export const SkillSection: React.FC<SkillSectionProps> = ({
  title,
  skills,
  isEditing,
  isDraggable = false,
  newSkill,
  setNewSkill,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onReorderSkills
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderSkills) {
      const oldIndex = skills.findIndex((skill) => skill.id === active.id);
      const newIndex = skills.findIndex((skill) => skill.id === over.id);

      const reorderedSkills = arrayMove(skills, oldIndex, newIndex);
      onReorderSkills(reorderedSkills);
    }
  };

  const handleAddSkill = () => {
    onAddSkill();
    setShowAddForm(false);
    setNewSkill({ name: '', proficiency: 1, priority: 0 });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-9"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {showAddForm && isEditing && (
          <Card className="border-2 border-dashed border-cvsite-teal/30 bg-cvsite-teal/5">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Input
                  placeholder="Enter skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Proficiency:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewSkill({ ...newSkill, proficiency: i + 1 })}
                          className={`w-6 h-6 rounded transition-colors ${
                            i < newSkill.proficiency 
                              ? 'bg-cvsite-teal hover:bg-cvsite-teal/80' 
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleAddSkill}
                      disabled={!newSkill.name.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {skills.length > 0 ? (
          <div className="space-y-2">
            {isDraggable && isEditing ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext 
                  items={skills.map(skill => skill.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      isEditing={isEditing}
                      isDraggable={isDraggable}
                      onUpdate={onUpdateSkill}
                      onDelete={onDeleteSkill}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isEditing={isEditing}
                  isDraggable={false}
                  onUpdate={onUpdateSkill}
                  onDelete={onDeleteSkill}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No {title.toLowerCase()} added yet.</p>
            {isEditing && (
              <p className="text-sm mt-1">Click "Add Skill" to get started.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
