
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { ProfileTabsList } from './tabs/ProfileTabsList';
import { ProfileTabsContent } from './tabs/ProfileTabsContent';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from './generalInfo/GeneralInfoTab';
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
  handleAddTechnicalSkill: () => Promise<void>;
  handleAddSpecializedSkill: () => Promise<void>;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, experience: Omit<Experience, 'id'>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  updateEducation: (id: string, education: Omit<Education, 'id'>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  updateTraining: (id: string, training: Omit<Training, 'id'>) => Promise<boolean>;
  deleteTraining: (id: string) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Omit<Project, 'id'>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projects: Project[]) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  reorderSpecializedSkills: (skills: Skill[]) => Promise<boolean>;
  saveGeneralInfo: (data: GeneralInfoFormData) => Promise<boolean>;
  cvImportHandlers?: any;
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
  reorderProjects,
  deleteTechnicalSkill,
  deleteSpecializedSkill,
  saveTechnicalSkill,
  saveSpecializedSkill,
  reorderTechnicalSkills,
  reorderSpecializedSkills,
  saveGeneralInfo
}) => {
  // Handle data changes for refreshing after imports
  const handleDataChange = () => {
    window.location.reload();
  };

  return (
    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
      <ProfileTabsList
        form={form}
        technicalSkills={technicalSkills}
        specializedSkills={specializedSkills}
        experiences={experiences}
        education={education}
        trainings={trainings}
        achievements={achievements}
        projects={projects}
      />

      <div className="flex-1 min-h-0">
        <ProfileTabsContent
          form={form}
          isEditing={isEditing}
          onImageUpdate={onImageUpdate}
          technicalSkills={technicalSkills}
          specializedSkills={specializedSkills}
          experiences={experiences}
          education={education}
          trainings={trainings}
          achievements={achievements}
          projects={projects}
          isSaving={isSaving}
          newTechnicalSkill={newTechnicalSkill}
          newSpecializedSkill={newSpecializedSkill}
          setNewTechnicalSkill={setNewTechnicalSkill}
          setNewSpecializedSkill={setNewSpecializedSkill}
          handleAddTechnicalSkill={handleAddTechnicalSkill}
          handleAddSpecializedSkill={handleAddSpecializedSkill}
          saveExperience={saveExperience}
          updateExperience={updateExperience}
          deleteExperience={deleteExperience}
          saveEducation={saveEducation}
          updateEducation={updateEducation}
          deleteEducation={deleteEducation}
          saveTraining={saveTraining}
          updateTraining={updateTraining}
          deleteTraining={deleteTraining}
          saveAchievement={saveAchievement}
          updateAchievement={updateAchievement}
          deleteAchievement={deleteAchievement}
          saveProject={saveProject}
          updateProject={updateProject}
          deleteProject={deleteProject}
          reorderProjects={reorderProjects}
          deleteTechnicalSkill={deleteTechnicalSkill}
          deleteSpecializedSkill={deleteSpecializedSkill}
          saveTechnicalSkill={saveTechnicalSkill}
          saveSpecializedSkill={saveSpecializedSkill}
          reorderTechnicalSkills={reorderTechnicalSkills}
          reorderSpecializedSkills={reorderSpecializedSkills}
          handleGeneralInfoSave={saveGeneralInfo}
          profileData={{}}
          importProfile={() => Promise.resolve({})}
          onDataChange={handleDataChange}
        />
      </div>
    </Tabs>
  );
};
