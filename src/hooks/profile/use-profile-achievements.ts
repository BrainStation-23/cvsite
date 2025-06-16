
import { useAchievements } from './use-achievements';

export function useProfileAchievements(profileId?: string) {
  const {
    achievements,
    isLoading,
    isSaving,
    saveAchievement,
    updateAchievement,
    deleteAchievement
  } = useAchievements(profileId);

  return {
    achievements,
    isLoading,
    isSaving,
    saveAchievement,
    updateAchievement,
    deleteAchievement
  };
}
