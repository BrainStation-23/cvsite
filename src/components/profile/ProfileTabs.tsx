import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from './generalInfo/GeneralInfoTab';
import { ProfileJSONService } from '@/services/profile/ProfileJSONService';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { ProfileTabsList } from './tabs/ProfileTabsList';
import { ProfileTabsContent } from './tabs/ProfileTabsContent';

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
  reorderProjects: (projects: Project[]) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  reorderSpecializedSkills: (skills: Skill[]) => Promise<boolean>;
  profileId?: string;
  saveGeneralInfo: (data: GeneralInfoFormData) => Promise<boolean>;
  onDataChange?: () => void;
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
  profileId,
  saveGeneralInfo,
  onDataChange
}) => {
  // Handle general info save with proper conversion and return boolean
  const handleGeneralInfoSave = async (data: GeneralInfoFormData): Promise<boolean> => {
    const saveData = {
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage,
      currentDesignation: data.currentDesignation || null
    };
    
    try {
      const success = await saveGeneralInfo(saveData);
      return success;
    } catch (error) {
      console.error('Failed to save general information:', error);
      return false;
    }
  };

  // Set up import handlers for JSON import
  const { importProfile } = useProfileImport({
    saveGeneralInfo: handleGeneralInfoSave,
    saveTechnicalSkill,
    saveSpecializedSkill,
    saveExperience,
    saveEducation,
    saveTraining,
    saveAchievement,
    saveProject
  });

  // Prepare raw profile data for processing
  const rawProfileData = {
    generalInfo: {
      firstName: form.getValues('firstName'),
      lastName: form.getValues('lastName'),
      biography: form.getValues('biography'),
      profileImage: form.getValues('profileImage'),
      currentDesignation: form.getValues('currentDesignation')
    },
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  };

  // Use ProfileJSONService to get clean, properly formatted data for JSON display
  const profileData = ProfileJSONService.exportProfile(rawProfileData);

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
        profileId={profileId}
        handleGeneralInfoSave={handleGeneralInfoSave}
        profileData={profileData}
        importProfile={importProfile}
        onDataChange={onDataChange}
      />
    </Tabs>
  );
};
