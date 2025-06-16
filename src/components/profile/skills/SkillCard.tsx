
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Check, X, GripVertical } from 'lucide-react';
import { Skill } from '@/types';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TechnicalSkillInput } from './TechnicalSkillInput';
import { DeviconService } from '@/utils/deviconUtils';

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
  const [editedSkill, setEditedSkill] = useState(skill);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: skill.id,
    disabled: !isDraggable || !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const handleNameChange = (name: string) => {
    setEditedSkill({ ...editedSkill, name });
    setHasChanges(name !== skill.name || editedSkill.proficiency !== skill.proficiency);
  };

  const handleProficiencyChange = (proficiency: number) => {
    setEditedSkill({ ...editedSkill, proficiency });
    setHasChanges(editedSkill.name !== skill.name || proficiency !== skill.proficiency);
  };

  const handleSave = () => {
    onUpdate(editedSkill);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditedSkill(skill);
    setHasChanges(false);
  };

  // Determine if the entire card should show drag cursor
  const shouldShowDragCursor = isDraggable && isEditing && !isDragging;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 hover:shadow-md ${
        isDragging ? 'ring-2 ring-cvsite-teal shadow-lg opacity-50' : ''
      } ${shouldShowDragCursor ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...(shouldShowDragCursor ? { ...attributes, ...listeners } : {})}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {isDraggable && isEditing && (
              <div className="flex-shrink-0 text-gray-400 hover:text-gray-600" data-tour="drag-handle">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  {skillType === 'technical' ? (
                    <TechnicalSkillInput
                      value={editedSkill.name}
                      onChange={handleNameChange}
                      placeholder="Technical skill name"
                      className="text-sm font-medium"
                    />
                  ) : (
                    <Input
                      value={editedSkill.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="text-sm font-medium"
                      placeholder="Skill name"
                    />
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Proficiency:</span>
                    <div className="flex space-x-1" data-tour="skill-proficiency">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProficiencyChange(i + 1);
                          }}
                          className={`w-5 h-5 rounded transition-colors ${
                            i < editedSkill.proficiency 
                              ? 'bg-cvsite-teal hover:bg-cvsite-teal/80' 
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">{editedSkill.proficiency}/10</span>
                  </div>
                  
                  {hasChanges && (
                    <div className="flex items-center space-x-2 pt-2" data-tour="skill-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className="h-7 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        className="h-7 px-3 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {skillType === 'technical' && (
                      <img 
                        src={DeviconService.getDeviconUrl(skill.name)} 
                        alt={skill.name}
                        className="w-5 h-5 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <h4 className="font-medium text-sm truncate capitalize">{skill.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Proficiency:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded transition-colors ${
                            i < skill.proficiency 
                              ? 'bg-cvsite-teal' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{skill.proficiency}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center space-x-1 flex-shrink-0" data-tour="skill-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(skill.id);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
