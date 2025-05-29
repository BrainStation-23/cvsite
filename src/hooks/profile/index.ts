
// Main profile hook that combines all profile-related functionality
import { useGeneralInfo } from './use-general-info';
import { useSkills } from './use-skills';
import { useExperience } from './use-experience';
import { useEducation } from './use-education';
import { useTraining } from './use-training';
import { useAchievements } from './use-achievements';
import { useProjects } from './use-projects';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  biography: string | null;
  profileImage: string | null;
}

export function useProfile() {
  // General Information
  const { 
    isLoading: generalInfoLoading, 
    generalInfo, 
    saveGeneralInfo, 
    isSaving: generalInfoSaving 
  } = useGeneralInfo();

  // Skills
  const { 
    isLoading: skillsLoading, 
    technicalSkills, 
    specializedSkills, 
    saveTechnicalSkill, 
    saveSpecializedSkill, 
    deleteTechnicalSkill, 
    deleteSpecializedSkill, 
    reorderTechnicalSkills,
    isSaving: skillsSaving 
  } = useSkills();

  // Experience
  const { 
    experiences, 
    saveExperience, 
    updateExperience, 
    deleteExperience, 
    isLoading: experienceLoading, 
    isSaving: experienceSaving 
  } = useExperience();

  // Education
  const { 
    education, 
    saveEducation, 
    updateEducation, 
    deleteEducation, 
    isLoading: educationLoading, 
    isSaving: educationSaving 
  } = useEducation();

  // Training
  const { 
    trainings, 
    saveTraining, 
    updateTraining, 
    deleteTraining, 
    isLoading: trainingLoading, 
    isSaving: trainingSaving 
  } = useTraining();

  // Achievements
  const { 
    achievements, 
    saveAchievement, 
    updateAchievement, 
    deleteAchievement, 
    isLoading: achievementsLoading, 
    isSaving: achievementsSaving 
  } = useAchievements();

  // Projects
  const { 
    projects, 
    saveProject, 
    updateProject, 
    deleteProject, 
    reorderProjects,
    isLoading: projectsLoading, 
    isSaving: projectsSaving 
  } = useProjects();

  const isLoading = generalInfoLoading || skillsLoading || experienceLoading || educationLoading || trainingLoading || achievementsLoading || projectsLoading;
  const isSaving = generalInfoSaving || skillsSaving || experienceSaving || educationSaving || trainingSaving || achievementsSaving || projectsSaving;

  return {
    isLoading,
    isSaving,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects,
    saveGeneralInfo,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
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
    reorderProjects
  };
}
