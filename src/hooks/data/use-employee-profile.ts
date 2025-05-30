
import { useGeneralInfoFetch } from '../profile/use-general-info-fetch';
import useSkillsFetch from '../profile/use-skills-fetch';
import { useExperienceFetch } from '../profile/use-experience-fetch';
import useEducationFetch from '../profile/use-education-fetch';
import useTrainingFetch from '../profile/use-training-fetch';
import useAchievementsFetch from '../profile/use-achievements-fetch';
import useProjectsFetch from '../profile/use-projects-fetch';

export function useEmployeeProfile(profileId: string) {
  const generalInfoHook = useGeneralInfoFetch(profileId);
  const skillsHook = useSkillsFetch();
  const experienceHook = useExperienceFetch();
  const educationHook = useEducationFetch();
  const trainingHook = useTrainingFetch();
  const achievementsHook = useAchievementsFetch();
  const projectsHook = useProjectsFetch();

  const isLoading = generalInfoHook.isLoading || 
                   skillsHook.isLoading || 
                   experienceHook.isLoading || 
                   educationHook.isLoading ||
                   trainingHook.isLoading ||
                   achievementsHook.isLoading ||
                   projectsHook.isLoading;

  const refetch = () => {
    generalInfoHook.refetch();
    skillsHook.refetch();
    experienceHook.refetch();
    educationHook.refetch();
    trainingHook.refetch();
    achievementsHook.refetch();
    projectsHook.refetch();
  };

  return {
    isLoading,
    generalInfo: generalInfoHook.generalInfo,
    technicalSkills: skillsHook.technicalSkills,
    specializedSkills: skillsHook.specializedSkills,
    experiences: experienceHook.data,
    education: educationHook.education,
    trainings: trainingHook.trainings,
    achievements: achievementsHook.achievements,
    projects: projectsHook.projects,
    refetch
  };
}
