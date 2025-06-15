
import React from 'react';
import { Skill } from '@/types';
import { SkillSection } from './skills/SkillSection';

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Skills</h2>
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
            showTourButton={true}
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
            showTourButton={true}
          />
        </div>
      </div>
    </div>
  );
};
