
import { useEducation } from './use-education';

export function useProfileEducation(profileId?: string) {
  const {
    education,
    isLoading,
    isSaving,
    saveEducation,
    updateEducation,
    deleteEducation
  } = useEducation(profileId);

  return {
    education,
    isLoading,
    isSaving,
    saveEducation,
    updateEducation,
    deleteEducation
  };
}
