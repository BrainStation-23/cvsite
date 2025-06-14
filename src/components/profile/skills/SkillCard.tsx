
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skill } from '@/types';
import { Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import { TechnicalSkillInput } from './TechnicalSkillInput';

interface SkillCardProps {
  skill: Skill;
  isEditing: boolean;
  isDraggable?: boolean;
  onUpdate: (skill: Skill) => void;
  onDelete: (id: string) => void;
  skillType?: 'technical' | 'specialized';
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isEditing,
  isDraggable = false,
  onUpdate,
  onDelete,
  skillType = 'specialized'
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSkill, setEditedSkill] = useState<Skill>(skill);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: skill.id,
    disabled: !isDraggable || !isEditing || isEditMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedSkill(skill);
  };

  const handleSave = () => {
    onUpdate(editedSkill);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedSkill(skill);
    setIsEditMode(false);
  };

  const handleDelete = () => {
    onDelete(skill.id);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`relative ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} transition-shadow`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            {isDraggable && isEditing && !isEditMode && (
              <div 
                {...attributes} 
                {...listeners}
                data-tour="skill-drag-handle"
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* Skill Content */}
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <div className="space-y-3">
                  {skillType === 'technical' ? (
                    <TechnicalSkillInput
                      value={editedSkill.name}
                      onChange={(value) => setEditedSkill({ ...editedSkill, name: value })}
                      placeholder="Enter technical skill name"
                      className="text-sm"
                    />
                  ) : (
                    <Input
                      value={editedSkill.name}
                      onChange={(e) => setEditedSkill({ ...editedSkill, name: e.target.value })}
                      placeholder="Skill name"
                      className="text-sm"
                    />
                  )}
                  
                  {/* Proficiency Editor */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Proficiency:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditedSkill({ ...editedSkill, proficiency: i + 1 })}
                          className={`w-4 h-4 rounded transition-colors ${
                            i < editedSkill.proficiency 
                              ? 'bg-cvsite-teal hover:bg-cvsite-teal/80' 
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{editedSkill.proficiency}/10</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium text-sm truncate">{skill.name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded ${
                            i < skill.proficiency ? 'bg-cvsite-teal' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{skill.proficiency}/10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {isEditMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSave}
                      disabled={!editedSkill.name.trim()}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDelete}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
