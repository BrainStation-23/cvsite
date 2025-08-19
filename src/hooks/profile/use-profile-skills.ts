
import { useSkills } from './use-skills';

export function useProfileSkills(profileId?: string) {
  const {
    isLoading,
    isSaving,
    technicalSkills,
    specializedSkills,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
    reorderSpecializedSkills
  } = useSkills(profileId);

  return {
    isLoading,
    isSaving,
    technicalSkills,
    specializedSkills,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
    reorderSpecializedSkills
  };
}
