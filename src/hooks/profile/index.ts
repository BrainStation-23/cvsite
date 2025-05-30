
import { useGeneralInfo } from './use-general-info';
import { useSkills } from './use-skills';
import { useExperience } from './use-experience';
import { useEducation } from './use-education';
import { useTraining } from './use-training';
import { useAchievements } from './use-achievements';
import { useProjects } from './use-projects';

export const useProfile = () => {
  const generalInfo = useGeneralInfo();
  const skills = useSkills();
  const experience = useExperience();
  const education = useEducation();
  const training = useTraining();
  const achievements = useAchievements();
  const projects = useProjects();

  return {
    generalInfo: {
      ...generalInfo,
      isLoading: generalInfo.isLoading,
    },
    skills: {
      ...skills,
      isLoading: skills.isLoading,
    },
    experience: {
      ...experience,
      isLoading: experience.isLoading,
    },
    education: {
      ...education,
      isLoading: education.isLoading,
    },
    training: {
      ...training,
      isLoading: training.isAdding || training.isUpdating || training.isRemoving,
    },
    achievements: {
      ...achievements,
      isLoading: achievements.isLoading,
    },
    projects: {
      ...projects,
      isLoading: projects.isLoading,
    },
  };
};

export * from './use-general-info';
export * from './use-skills';
export * from './use-experience';
export * from './use-education';
export * from './use-training';
export * from './use-achievements';
export * from './use-projects';
