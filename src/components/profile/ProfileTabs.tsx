
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoTab, GeneralInfoFormData } from './GeneralInfoTab';
import { SkillsTab } from './SkillsTab';
import { ExperienceTab } from './ExperienceTab';
import { EducationTab } from './EducationTab';
import { TrainingTab } from './training/TrainingTab';
import { AchievementsTab } from './AchievementsTab';
import { ProjectsTab } from './ProjectsTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

interface ProfileTabsProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  onImageUpdate: (imageUrl: string | null) => void;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
  isSaving: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  newSpecializedSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  setNewSpecializedSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  handleAddSpecializedSkill: () => void;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  updateEducation: (id: string, education: Partial<Education>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  updateTraining: (id: string, training: Partial<Training>) => Promise<boolean>;
  deleteTraining: (id: string) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  form,
  isEditing,
  onImageUpdate,
  technicalSkills,
  specializedSkills,
  experiences,
  education,
  trainings,
  achievements,
  projects,
  isSaving,
  newTechnicalSkill,
  newSpecializedSkill,
  setNewTechnicalSkill,
  setNewSpecializedSkill,
  handleAddTechnicalSkill,
  handleAddSpecializedSkill,
  saveExperience,
  updateExperience,
  deleteExperience,
  saveEducation,
  updateEducation,
  deleteEducation,
  saveTraining,
  updateTraining,
  deleteTraining,
  saveAchievement,
  updateAchievement,
  deleteAchievement,
  saveProject,
  updateProject,
  deleteProject,
  deleteTechnicalSkill,
  deleteSpecializedSkill,
  saveTechnicalSkill,
  saveSpecializedSkill,
  reorderTechnicalSkills
}) => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="mt-6">
        <GeneralInfoTab 
          form={form} 
          isEditing={isEditing} 
          onImageUpdate={onImageUpdate} 
        />
      </TabsContent>
      
      <TabsContent value="skills" className="mt-6">
        <SkillsTab
          technicalSkills={technicalSkills}
          specializedSkills={specializedSkills}
          isEditing={isEditing}
          newTechnicalSkill={newTechnicalSkill}
          newSpecializedSkill={newSpecializedSkill}
          setNewTechnicalSkill={setNewTechnicalSkill}
          setNewSpecializedSkill={setNewSpecializedSkill}
          handleAddTechnicalSkill={handleAddTechnicalSkill}
          handleAddSpecializedSkill={handleAddSpecializedSkill}
          deleteTechnicalSkill={deleteTechnicalSkill}
          deleteSpecializedSkill={deleteSpecializedSkill}
          saveTechnicalSkill={saveTechnicalSkill}
          saveSpecializedSkill={saveSpecializedSkill}
          onReorderTechnicalSkills={reorderTechnicalSkills}
        />
      </TabsContent>
      
      <TabsContent value="experience">
        <ExperienceTab
          experiences={experiences}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveExperience}
          onUpdate={updateExperience}
          onDelete={deleteExperience}
        />
      </TabsContent>
      
      <TabsContent value="education">
        <EducationTab
          education={education}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveEducation}
          onUpdate={updateEducation}
          onDelete={deleteEducation}
        />
      </TabsContent>
      
      <TabsContent value="training">
        <TrainingTab
          trainings={trainings}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveTraining}
          onUpdate={updateTraining}
          onDelete={deleteTraining}
        />
      </TabsContent>
      
      <TabsContent value="achievements">
        <AchievementsTab
          achievements={achievements}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveAchievement}
          onUpdate={updateAchievement}
          onDelete={deleteAchievement}
        />
      </TabsContent>
      
      <TabsContent value="projects">
        <ProjectsTab
          projects={projects}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveProject}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />
      </TabsContent>
    </Tabs>
  );
};
