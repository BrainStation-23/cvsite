
import { useProfileGeneralInfo } from './use-profile-general-info';
import { useProfileSkills } from './use-profile-skills';
import { useProfileExperience } from './use-profile-experience';
import { useProfileEducation } from './use-profile-education';
import { useProfileTraining } from './use-profile-training';
import { useProfileAchievements } from './use-profile-achievements';
import { useProfileProjects } from './use-profile-projects';

export function useProfileComposite(profileId?: string) {
  const generalInfoHook = useProfileGeneralInfo(profileId);
  const skillsHook = useProfileSkills(profileId);
  const experienceHook = useProfileExperience(profileId);
  const educationHook = useProfileEducation(profileId);
  const trainingHook = useProfileTraining(profileId);
  const achievementsHook = useProfileAchievements(profileId);
  const projectsHook = useProfileProjects(profileId);

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

  // Refetch all data
  const refetch = () => {
    if (generalInfoHook.refetch) generalInfoHook.refetch();
    if (skillsHook.refetch) skillsHook.refetch();
    if (experienceHook.refetch) experienceHook.refetch();
    if (educationHook.refetch) educationHook.refetch();
    if (trainingHook.refetch) trainingHook.refetch();
    if (achievementsHook.refetch) achievementsHook.refetch();
    if (projectsHook.refetch) projectsHook.refetch();
  };

  return {
    isLoading,
    isSaving,
    refetch,
    // General info
    generalInfo: generalInfoHook.generalInfo,
    saveGeneralInfo: generalInfoHook.saveGeneralInfo,
    // Skills
    technicalSkills: skillsHook.technicalSkills,
    specializedSkills: skillsHook.specializedSkills,
    saveTechnicalSkill: skillsHook.saveTechnicalSkill,
    saveSpecializedSkill: skillsHook.saveSpecializedSkill,
    deleteTechnicalSkill: skillsHook.deleteTechnicalSkill,
    deleteSpecializedSkill: skillsHook.deleteSpecializedSkill,
    reorderTechnicalSkills: skillsHook.reorderTechnicalSkills,
    reorderSpecializedSkills: skillsHook.reorderSpecializedSkills,
    // Experience
    experiences: experienceHook.experiences,
    saveExperience: experienceHook.saveExperience,
    updateExperience: experienceHook.updateExperience,
    deleteExperience: experienceHook.deleteExperience,
    // Education
    education: educationHook.education,
    saveEducation: educationHook.saveEducation,
    updateEducation: educationHook.updateEducation,
    deleteEducation: educationHook.deleteEducation,
    // Training
    trainings: trainingHook.trainings,
    saveTraining: trainingHook.saveTraining,
    updateTraining: trainingHook.updateTraining,
    deleteTraining: trainingHook.deleteTraining,
    // Achievements
    achievements: achievementsHook.achievements,
    saveAchievement: achievementsHook.saveAchievement,
    updateAchievement: achievementsHook.updateAchievement,
    deleteAchievement: achievementsHook.deleteAchievement,
    // Projects
    projects: projectsHook.projects,
    saveProject: projectsHook.saveProject,
    updateProject: projectsHook.updateProject,
    deleteProject: projectsHook.deleteProject,
    reorderProjects: projectsHook.reorderProjects
  };
}
