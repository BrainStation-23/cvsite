import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GeneralInfo {
  firstName: string;
  lastName: string;
  biography: string | null;
  profileImage: string | null;
  currentDesignation: string | null;
}

export function useGeneralInfo(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalInfo, setGeneralInfo] = useState({
    firstName: '',
    lastName: '',
    biography: null,
    profileImage: null,
    currentDesignation: null
  });

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch general info
  const fetchGeneralInfo = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, biography, profile_image, current_designation')
        .eq('id', targetProfileId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setGeneralInfo({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          biography: data.biography,
          profileImage: data.profile_image,
          currentDesignation: data.current_designation
        });
      }
    } catch (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch function
  const refetch = () => {
    fetchGeneralInfo();
  };

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

  // Load general info data
  useEffect(() => {
    if (targetProfileId) {
      fetchGeneralInfo();
    }
  }, [targetProfileId]);

  return {
    isLoading,
    isSaving,
    generalInfo,
    saveGeneralInfo,
    refetch
  };
}
