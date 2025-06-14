
import React from 'react';
import { Skill } from '@/types';
import { SkillSection } from './skills/SkillSection';
import { SkillsTourButton } from './SkillsTourButton';

interface SkillsTabProps {
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  isEditing: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  newSpecializedSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  setNewSpecializedSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  handleAddSpecializedSkill: () => void;
  deleteTechnicalSkill: (id: string) => void;
  deleteSpecializedSkill: (id: string) => void;
  saveTechnicalSkill: (skill: Skill) => void;
  saveSpecializedSkill: (skill: Skill) => void;
  onReorderTechnicalSkills?: (reorderedSkills: Skill[]) => void;
  onReorderSpecializedSkills?: (reorderedSkills: Skill[]) => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  technicalSkills,
  specializedSkills,
  isEditing,
  newTechnicalSkill,
  newSpecializedSkill,
  setNewTechnicalSkill,
  setNewSpecializedSkill,
  handleAddTechnicalSkill,
  handleAddSpecializedSkill,
  deleteTechnicalSkill,
  deleteSpecializedSkill,
  saveTechnicalSkill,
  saveSpecializedSkill,
  onReorderTechnicalSkills,
  onReorderSpecializedSkills
}) => {
  return (
    <div className="space-y-6">
      {/* Header with tour button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skills</h2>
        <SkillsTourButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="technical-skills">
          <SkillSection
            title="Technical Skills"
            skills={technicalSkills}
            isEditing={isEditing}
            isDraggable={true}
            newSkill={newTechnicalSkill}
            setNewSkill={setNewTechnicalSkill}
            onAddSkill={handleAddTechnicalSkill}
            onUpdateSkill={saveTechnicalSkill}
            onDeleteSkill={deleteTechnicalSkill}
            onReorderSkills={onReorderTechnicalSkills}
            skillType="technical"
          />
        </div>
        
        <div data-tour="specialized-skills">
          <SkillSection
            title="Specialized Skills"
            skills={specializedSkills}
            isEditing={isEditing}
            isDraggable={true}
            newSkill={newSpecializedSkill}
            setNewSkill={setNewSpecializedSkill}
            onAddSkill={handleAddSpecializedSkill}
            onUpdateSkill={saveSpecializedSkill}
            onDeleteSkill={deleteSpecializedSkill}
            onReorderSkills={onReorderSpecializedSkills}
            skillType="specialized"
          />
        </div>
      </div>
    </div>
  );
};
