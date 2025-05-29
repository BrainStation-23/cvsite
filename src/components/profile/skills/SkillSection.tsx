
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skill } from '@/types';
import { SkillAddForm } from './SkillAddForm';
import { SkillList } from './SkillList';

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

  const handleCancel = () => {
    setShowAddForm(false);
    setNewSkill({ name: '', proficiency: 1, priority: 0 });
  };

  const handleAddSkill = () => {
    onAddSkill();
    setShowAddForm(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <SkillAddForm
            showAddForm={showAddForm}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAddSkill={handleAddSkill}
            onCancel={handleCancel}
            onShowForm={() => setShowAddForm(true)}
            isEditing={isEditing}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <SkillList
          skills={skills}
          isEditing={isEditing}
          isDraggable={isDraggable}
          onUpdateSkill={onUpdateSkill}
          onDeleteSkill={onDeleteSkill}
          onReorderSkills={onReorderSkills}
          title={title}
        />
      </CardContent>
    </Card>
  );
};
