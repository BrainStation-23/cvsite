
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';

export function useGeneralInfo(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoFormData>({
    firstName: '',
    lastName: '',
    biography: '',
    profileImage: null,
    currentDesignation: null
  });

  const fetchGeneralInfo = async () => {
    if (!profileId) return;

    try {
      const { data: generalData, error: generalError } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (generalError) throw generalError;

      if (generalData) {
        setGeneralInfo({
          firstName: generalData.first_name || '',
          lastName: generalData.last_name || '',
          biography: generalData.biography || '',
          profileImage: generalData.profile_image || null,
          currentDesignation: generalData.current_designation || null
        });
      }
    } catch (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load general information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveGeneralInfo = async (data: GeneralInfoFormData) => {
    if (!profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        const { error } = await supabase
          .from('general_information')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            profile_image: data.profileImage,
            current_designation: data.currentDesignation,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', profileId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: profileId,
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            profile_image: data.profileImage,
            current_designation: data.currentDesignation
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setGeneralInfo(data);
      
      toast({
        title: 'Success',
        description: 'General information has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update general information',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchGeneralInfo();
  }, [profileId]);

  return {
    isLoading,
    isSaving,
    generalInfo,
    saveGeneralInfo,
    refetch: fetchGeneralInfo
  };
}
