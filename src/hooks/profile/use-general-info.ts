
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GeneralInfo {
  firstName: string;
  lastName: string;
  designation: string | null;
  biography: string | null;
  profileImage: string | null;
}

export function useGeneralInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    firstName: '',
    lastName: '',
    designation: null,
    biography: null,
    profileImage: null
  });

  // Fetch general info
  const fetchGeneralInfo = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error } = await supabase
            .from('profiles')
            .insert({ id: user.id });
            
          if (error) throw error;
        } else {
          throw profileError;
        }
      }
      
      // Get general info
      const { data, error } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setGeneralInfo({
          firstName: data.first_name,
          lastName: data.last_name,
          designation: data.designation,
          biography: data.biography,
          profileImage: data.profile_image
        });
      } else {
        // Use user data as fallback
        setGeneralInfo({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          designation: null,
          biography: null,
          profileImage: user.profileImageUrl || null
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

  // Save general info
  const saveGeneralInfo = async (data: {
    firstName: string;
    lastName: string;
    designation: string | null;
    biography: string | null;
  }) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      // First, check if a record exists
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('general_information')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            designation: data.designation,
            biography: data.biography,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: user.id,
            org_id: 'default', // Default org ID, replace with actual org ID if available
            first_name: data.firstName,
            last_name: data.lastName,
            designation: data.designation,
            biography: data.biography
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setGeneralInfo(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        designation: data.designation,
        biography: data.biography
      }));
      
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
    if (user?.id) {
      fetchGeneralInfo();
    }
  }, [user?.id]);

  return {
    isLoading,
    isSaving,
    generalInfo,
    saveGeneralInfo,
  };
}
