
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface GeneralInfo {
  firstName: string;
  lastName: string;
  biography: string | null;
  profileImage: string | null;
  currentDesignation: string | null;
}

export function useGeneralInfo(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  console.log('=== useGeneralInfo Debug ===');
  console.log('Profile ID:', profileId);
  console.log('Target Profile ID:', targetProfileId);
  console.log('Auth User ID:', user?.id);

  // Use React Query to fetch general info
  const { data, error, refetch, isLoading } = useQuery({
    queryKey: ['generalInfo', targetProfileId],
    queryFn: async () => {
      if (!targetProfileId) throw new Error('No profile ID available');
      
      console.log('=== Fetching General Info ===');
      console.log('Fetching for profile ID:', targetProfileId);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', targetProfileId)
        .maybeSingle();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
      
      console.log('Profile exists:', !!profile);
      
      if (!profile && !profileId) {
        // Only create profile if this is for the current user (no profileId provided)
        console.log('Creating new profile for current user');
        const { error } = await supabase
          .from('profiles')
          .insert({ id: targetProfileId });
          
        if (error) {
          console.error('Profile creation error:', error);
          throw error;
        }
      }
      
      // Get general info
      console.log('Fetching general information...');
      const { data, error: generalInfoError } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', targetProfileId)
        .maybeSingle();
      
      if (generalInfoError && generalInfoError.code !== 'PGRST116') {
        console.error('General info fetch error:', generalInfoError);
        throw generalInfoError;
      }
      
      console.log('Raw general info data:', data);
      
      if (data) {
        const result = {
          firstName: data.first_name,
          lastName: data.last_name,
          biography: data.biography,
          profileImage: data.profile_image,
          currentDesignation: data.current_designation
        };
        console.log('Processed general info result:', result);
        return result;
      } else {
        // Use user data as fallback only if this is current user
        if (!profileId && user) {
          const fallbackResult = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            biography: null,
            profileImage: user.profileImageUrl || null,
            currentDesignation: null
          };
          console.log('Using fallback user data:', fallbackResult);
          return fallbackResult;
        }
        const emptyResult = {
          firstName: '',
          lastName: '',
          biography: null,
          profileImage: null,
          currentDesignation: null
        };
        console.log('Returning empty result:', emptyResult);
        return emptyResult;
      }
    },
    enabled: !!targetProfileId,
  });

  // Handle error in fetching
  useEffect(() => {
    if (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Save general info
  const saveGeneralInfo = async (data: {
    firstName: string;
    lastName: string;
    biography: string | null;
    profileImage?: string | null;
    currentDesignation?: string | null;
  }) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      console.log('=== Saving General Info ===');
      console.log('Profile ID:', targetProfileId);
      console.log('Data to save:', data);
      
      // First, check if a record exists
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', targetProfileId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check existing data error:', checkError);
        throw checkError;
      }
      
      console.log('Existing record found:', !!existingData);
      
      if (existingData) {
        // Update existing record
        console.log('Updating existing record...');
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
          .eq('profile_id', targetProfileId);
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful');
      } else {
        // Create new record
        console.log('Creating new record...');
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: targetProfileId,
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            profile_image: data.profileImage,
            current_designation: data.currentDesignation
          });
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert successful');
      }
      
      // Refetch the data to update local state
      refetch();
      
      toast({
        title: 'Success',
        description: 'Profile information has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile information',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    generalInfo: data || {
      firstName: '',
      lastName: '',
      biography: null,
      profileImage: null,
      currentDesignation: null
    },
    saveGeneralInfo,
  };
}
