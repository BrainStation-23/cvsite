
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Check, X, GripVertical } from 'lucide-react';
import { Skill } from '@/types';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SkillCardProps {
  skill: Skill;
  isEditing: boolean;
  isDraggable?: boolean;
  onUpdate: (skill: Skill) => void;
  onDelete: (id: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isEditing,
  isDraggable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [editedSkill, setEditedSkill] = useState(skill);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: skill.id,
    disabled: !isDraggable || !isEditing || isEditingSkill
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const handleSaveEdit = () => {
    onUpdate(editedSkill);
    setIsEditingSkill(false);
  };

  const handleCancelEdit = () => {
    setEditedSkill(skill);
    setIsEditingSkill(false);
  };

  const handleProficiencyClick = (newProficiency: number) => {
    if (isEditing && !isEditingSkill) {
      const updatedSkill = { ...skill, proficiency: newProficiency };
      onUpdate(updatedSkill);
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 hover:shadow-md ${
        isDragging ? 'ring-2 ring-cvsite-teal shadow-lg opacity-90' : ''
      } ${isDraggable && isEditing && !isEditingSkill ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {isDraggable && isEditing && !isEditingSkill && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              >
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {isEditingSkill ? (
                <div className="space-y-2">
                  <Input
                    value={editedSkill.name}
                    onChange={(e) => setEditedSkill({ ...editedSkill, name: e.target.value })}
                    className="text-sm"
                    placeholder="Skill name"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Proficiency:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditedSkill({ ...editedSkill, proficiency: i + 1 })}
                          className={`w-5 h-5 rounded transition-colors ${
                            i < editedSkill.proficiency 
                              ? 'bg-cvsite-teal hover:bg-cvsite-teal/80' 
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-sm truncate">{skill.name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-600">Proficiency:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleProficiencyClick(i + 1)}
                          disabled={!isEditing}
                          className={`w-4 h-4 rounded transition-colors ${
                            i < skill.proficiency 
                              ? 'bg-cvsite-teal' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          } ${
                            isEditing ? 'hover:scale-110 cursor-pointer' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isEditingSkill ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingSkill(true)}
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(skill.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
