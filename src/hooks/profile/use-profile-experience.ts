
import { useExperience } from './use-experience';

export function useProfileExperience(profileId?: string) {
  const {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience
  } = useExperience(profileId);

  return {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience
  };
}
