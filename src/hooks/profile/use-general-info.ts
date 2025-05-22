
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export interface GeneralInfo {
  firstName: string;
  lastName: string;
  designation: string | null;
  biography: string | null;
  profileImage: string | null;
  orgId: string | null;
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
    profileImage: null,
    orgId: null
  });

  // Use React Query to fetch general info
  const { data, error, refetch } = useQuery({
    queryKey: ['generalInfo', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID available');
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (!profile) {
        // Profile doesn't exist, create one
        const { error } = await supabase
          .from('profiles')
          .insert({ id: user.id });
          
        if (error) throw error;
      }
      
      // Get general info
      const { data, error: generalInfoError } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();
      
      if (generalInfoError && generalInfoError.code !== 'PGRST116') {
        throw generalInfoError;
      }
      
      if (data) {
        return {
          firstName: data.first_name,
          lastName: data.last_name,
          designation: data.designation,
          biography: data.biography,
          profileImage: data.profile_image,
          orgId: data.org_id
        };
      } else {
        // Use user data as fallback
        return {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          designation: null,
          biography: null,
          profileImage: user.profileImageUrl || null,
          orgId: 'default'
        };
      }
    },
    enabled: !!user?.id,
  });

  // Update general info state when data changes
  useEffect(() => {
    if (data) {
      setGeneralInfo(data);
      setIsLoading(false);
    }
  }, [data]);

  // Handle error in fetching
  useEffect(() => {
    if (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  }, [error, toast]);

  // Save general info
  const saveGeneralInfo = async (data: {
    firstName: string;
    lastName: string;
    designation: string | null;
    biography: string | null;
    orgId: string | null;
  }) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      // First, check if a record exists
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      
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
            org_id: data.orgId,
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
            org_id: data.orgId || 'default',
            first_name: data.firstName,
            last_name: data.lastName,
            designation: data.designation,
            biography: data.biography
          });
        
        if (error) throw error;
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
    generalInfo,
    saveGeneralInfo,
  };
}
