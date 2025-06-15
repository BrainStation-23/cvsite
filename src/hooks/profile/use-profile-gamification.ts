
import { useMemo } from 'react';
import { GamificationService, GamificationStats, ProfileData } from '@/services/gamification/GamificationService';
import { GeneralInfo, Skill, Experience, Education, Training, Achievement, Project } from '@/types';

interface UseProfileGamificationProps {
  generalInfo?: GeneralInfo;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
}

export function useProfileGamification({
  generalInfo,
  technicalSkills,
  specializedSkills,
  experiences,
  education,
  trainings,
  achievements,
  projects
}: UseProfileGamificationProps): GamificationStats {
  const gamificationStats = useMemo(() => {
    const profileData: ProfileData = {
      generalInfo,
      technicalSkills: technicalSkills || [],
      specializedSkills: specializedSkills || [],
      experiences: experiences || [],
      education: education || [],
      trainings: trainings || [],
      achievements: achievements || [],
      projects: projects || []
    };

    return GamificationService.getGamificationStats(profileData);
  }, [
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  ]);

  return gamificationStats;
}
