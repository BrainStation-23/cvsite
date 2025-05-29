
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeGeneralInfo {
  firstName: string;
  lastName: string;
  biography: string | null;
  profileImage: string | null;
}

export function useGeneralInfoFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [generalInfo, setGeneralInfo] = useState<EmployeeGeneralInfo>({
    firstName: '',
    lastName: '',
    biography: null,
    profileImage: null
  });

  const fetchGeneralInfo = async () => {
    if (!profileId) return;

    try {
      // Fetch profile data first to get employee_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('employee_id, first_name, last_name')
        .eq('id', profileId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fetch general information
      const { data: generalData, error: generalError } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (generalError) throw generalError;

      if (generalData) {
        setGeneralInfo({
          firstName: generalData.first_name || profileData?.first_name || '',
          lastName: generalData.last_name || profileData?.last_name || '',
          biography: generalData.biography,
          profileImage: generalData.profile_image
        });
      } else if (profileData) {
        // Fallback to profiles table data if no general_information exists
        setGeneralInfo({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          biography: null,
          profileImage: null
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

  useEffect(() => {
    fetchGeneralInfo();
  }, [profileId]);

  return {
    isLoading,
    generalInfo,
    refetch: fetchGeneralInfo
  };
}
