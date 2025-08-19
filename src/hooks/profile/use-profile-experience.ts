
import { useExperience } from './use-experience';

export function useProfileExperience(profileId?: string) {
  const {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience,
    refetch
  } = useExperience(profileId);

  return {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience,
    refetch
  };
}
