
import { useState } from 'react';
import { useGeneralInfo } from './use-general-info';
import { useSkills } from './use-skills';
import { useExperience } from './use-experience';
import { useEducation } from './use-education';
import { useTraining } from './use-training';
import { useAchievements } from './use-achievements';
import { useProjects } from './use-projects';

export { useGeneralInfo } from './use-general-info';
export { useSkills } from './use-skills';
export { useExperience } from './use-experience';
export { useEducation } from './use-education';
export { useTraining } from './use-training';
export { useAchievements } from './use-achievements';
export { useProjects } from './use-projects';

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  biography: string;
};

export function useProfile() {
  const generalInfoHook = useGeneralInfo();
  const skillsHook = useSkills();
  const experienceHook = useExperience();
  const educationHook = useEducation();
  const trainingHook = useTraining();
  const achievementsHook = useAchievements();
  const projectsHook = useProjects();

  const isLoading = generalInfoHook.isLoading || 
                   skillsHook.isLoading || 
                   experienceHook.isLoading || 
                   educationHook.isLoading ||
                   trainingHook.isLoading ||
                   achievementsHook.isLoading ||
                   projectsHook.isLoading;
  
  const isSaving = generalInfoHook.isSaving || 
                   skillsHook.isSaving || 
                   experienceHook.isSaving || 
                   educationHook.isSaving ||
                   trainingHook.isSaving ||
                   achievementsHook.isSaving ||
                   projectsHook.isSaving;

  return {
    // State
    isLoading,
    isSaving,
    generalInfo: generalInfoHook.generalInfo,
    technicalSkills: skillsHook.technicalSkills,
    specializedSkills: skillsHook.specializedSkills,
    experiences: experienceHook.experiences,
    education: educationHook.education,
    trainings: trainingHook.trainings,
    achievements: achievementsHook.achievements,
    projects: projectsHook.projects,
    
    // Methods
    saveGeneralInfo: generalInfoHook.saveGeneralInfo,
    saveTechnicalSkill: skillsHook.saveTechnicalSkill,
    saveSpecializedSkill: skillsHook.saveSpecializedSkill,
    deleteTechnicalSkill: skillsHook.deleteTechnicalSkill,
    deleteSpecializedSkill: skillsHook.deleteSpecializedSkill,
    reorderTechnicalSkills: skillsHook.reorderTechnicalSkills,
    saveExperience: experienceHook.saveExperience,
    updateExperience: experienceHook.updateExperience,
    deleteExperience: experienceHook.deleteExperience,
    saveEducation: educationHook.saveEducation,
    updateEducation: educationHook.updateEducation,
    deleteEducation: educationHook.deleteEducation,
    saveTraining: trainingHook.saveTraining,
    updateTraining: trainingHook.updateTraining,
    deleteTraining: trainingHook.deleteTraining,
    saveAchievement: achievementsHook.saveAchievement,
    updateAchievement: achievementsHook.updateAchievement, 
    deleteAchievement: achievementsHook.deleteAchievement,
    saveProject: projectsHook.saveProject,
    updateProject: projectsHook.updateProject,
    deleteProject: projectsHook.deleteProject,
    reorderProjects: projectsHook.reorderProjects
  };
}
