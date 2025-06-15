
import { useGeneralInfo } from './use-general-info';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';

export function useProfileGeneralInfo(profileId?: string) {
  const { generalInfo, isLoading, isSaving, saveGeneralInfo } = useGeneralInfo(profileId);

  const handleSaveGeneralInfo = async (data: GeneralInfoFormData) => {
    return await saveGeneralInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage,
      currentDesignation: data.currentDesignation || null
    });
  };

  return {
    generalInfo,
    isLoading,
    isSaving,
    saveGeneralInfo: handleSaveGeneralInfo
  };
}
