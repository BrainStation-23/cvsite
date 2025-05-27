
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { Skill } from '@/types';

interface DraggableTechnicalSkillsProps {
  technicalSkills: Skill[];
  isEditing: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  deleteTechnicalSkill: (id: string) => void;
  onReorder: (reorderedSkills: Skill[]) => void;
}

export const DraggableTechnicalSkills: React.FC<DraggableTechnicalSkillsProps> = ({
  technicalSkills,
  isEditing,
  newTechnicalSkill,
  setNewTechnicalSkill,
  handleAddTechnicalSkill,
  deleteTechnicalSkill,
  onReorder
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reorderedSkills = [...technicalSkills];
    const draggedSkill = reorderedSkills[draggedIndex];
    
    // Remove the dragged item
    reorderedSkills.splice(draggedIndex, 1);
    
    // Insert at new position
    reorderedSkills.splice(dropIndex, 0, draggedSkill);
    
    onReorder(reorderedSkills);
    setDraggedIndex(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Technical Skills</CardTitle>
        {isEditing && (
          <Button variant="outline" size="sm" className="h-8" 
            onClick={handleAddTechnicalSkill} disabled={!newTechnicalSkill.name}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <Input
                placeholder="Skill name"
                value={newTechnicalSkill.name}
                onChange={(e) => setNewTechnicalSkill({...newTechnicalSkill, name: e.target.value})}
                className="flex-1"
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm">Proficiency:</span>
              <div className="flex flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewTechnicalSkill({...newTechnicalSkill, proficiency: i + 1})}
                    className={`w-6 h-6 rounded mx-0.5 transition-colors ${
                      i < newTechnicalSkill.proficiency 
                        ? 'bg-cvsite-teal' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {technicalSkills.length > 0 ? (
          <ul className="space-y-2">
            {technicalSkills.map((skill, index) => (
              <li 
                key={skill.id} 
                className={`flex items-center justify-between p-2 rounded border ${
                  isEditing ? 'cursor-move hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex items-center">
                  {isEditing && (
                    <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span>{skill.name}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0"
                      onClick={() => deleteTechnicalSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded ${
                        i < skill.proficiency 
                          ? 'bg-cvsite-teal' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      } mx-0.5`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No technical skills added yet.
            {isEditing && ' Fill in the form above to add your skills.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
