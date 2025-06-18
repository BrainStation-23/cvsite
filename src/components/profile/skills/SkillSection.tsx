
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skill } from '@/types';
import { SkillAddForm } from './SkillAddForm';
import { SkillList } from './SkillList';
import { SkillsTourButton } from './SkillsTourButton';

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
  skillType?: 'technical' | 'specialized';
  showTourButton?: boolean;
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
  onReorderSkills,
  skillType = 'specialized',
  showTourButton = false
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

  const tourAttribute = skillType === 'technical' ? 'add-technical-skill' : 'add-specialized-skill';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showTourButton && <SkillsTourButton />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add skill section - now inside the card content */}
        {isEditing && (
          <div className="space-y-3">
            {!showAddForm ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddForm(true)}
                className="w-full h-9 text-cvsite-teal border-cvsite-teal hover:bg-cvsite-teal hover:text-white border-dashed"
                data-tour={tourAttribute}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add {title.slice(0, -1)}
              </Button>
            ) : (
              <SkillAddForm
                showAddForm={showAddForm}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                onAddSkill={handleAddSkill}
                onCancel={handleCancel}
                onShowForm={() => setShowAddForm(true)}
                isEditing={isEditing}
                skillType={skillType}
              />
            )}
            {/* Separator line when add form is shown or skills exist */}
            {(showAddForm || skills.length > 0) && (
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
            )}
          </div>
        )}

        <SkillList
          skills={skills}
          isEditing={isEditing}
          isDraggable={isDraggable}
          onUpdateSkill={onUpdateSkill}
          onDeleteSkill={onDeleteSkill}
          onReorderSkills={onReorderSkills}
          title={title}
          skillType={skillType}
        />
      </CardContent>
    </Card>
  );
};
