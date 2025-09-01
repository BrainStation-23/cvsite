
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Experience } from '@/types';

// Type for database experience record format
type ExperienceDB = {
  id: string;
  profile_id: string;
  company_name: string;
  designation?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  created_at: string;
  updated_at: string;
};

// Map from database format to application model
const mapToExperience = (data: ExperienceDB): Experience => ({
  id: data.id,
  companyName: data.company_name,
  designation: data.designation || '',
  description: data.description || '',
  startDate: new Date(data.start_date).toISOString(),
  endDate: data.end_date ? new Date(data.end_date).toISOString() : undefined,
  isCurrent: data.is_current || false
});

// Map from application model to database format
const mapToExperienceDB = (exp: Omit<Experience, 'id'>, profileId: string) => ({
  profile_id: profileId,
  company_name: exp.companyName,
  designation: exp.designation,
  description: exp.description,
  start_date: exp.startDate,
  end_date: exp.endDate ?? null,
  is_current: exp.isCurrent || false
});

export function useExperience(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch experiences
  const fetchExperiences = async () => {
    if (!targetProfileId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching experiences for profile:', targetProfileId);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToExperience);
        console.log('Fetched experiences:', mappedData);
        setExperiences(mappedData);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load experience information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save experience - only allow if editing own profile or admin/manager
  const saveExperience = async (experience: Omit<Experience, 'id'>) => {
    if (!targetProfileId) return false;
    
    // Check if user can edit this profile
    if (targetProfileId !== user?.id && user?.role !== 'admin' && user?.role !== 'manager') {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to edit this profile',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setIsSaving(true);
      
      // Convert to database format
      const dbData = mapToExperienceDB(experience, targetProfileId);
      
      const { data, error } = await supabase
        .from('experiences')
        .insert(dbData)
        .select();
      
      if (error) throw error;
      
      // Update local state with the new experience entry
      if (data && data.length > 0) {
        const newExperience = mapToExperience(data[0] as ExperienceDB);
        setExperiences(prev => [...prev, newExperience]);
      }
      
      toast({
        title: 'Success',
        description: 'Experience has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to add experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update experience - only allow if editing own profile or admin/manager
  const updateExperience = async (id: string, experience: Partial<Experience>) => {
    if (!targetProfileId) return false;
    
    // Check if user can edit this profile
    if (targetProfileId !== user?.id && user?.role !== 'admin' && user?.role !== 'manager') {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to edit this profile',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setIsSaving(true);
      
      // Convert partial experience data to database format
      const dbData: Partial<ExperienceDB> = {};
      
      if (experience.companyName) dbData.company_name = experience.companyName;
      if (experience.designation !== undefined) {
        dbData.designation = experience.designation;
      }
      if (experience.description !== undefined) dbData.description = experience.description;
      if (experience.startDate) dbData.start_date = experience.startDate;
      
      if (experience.endDate) {
        dbData.end_date = experience.endDate;
      } else if (experience.endDate === null || experience.endDate === undefined) {
        dbData.end_date = null;
      }
      
      if (experience.isCurrent !== undefined) dbData.is_current = experience.isCurrent;
      
      dbData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('experiences')
        .update(dbData)
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setExperiences(prev => 
        prev.map(exp => exp.id === id ? { ...exp, ...experience } : exp)
      );
      
      toast({
        title: 'Success',
        description: 'Experience has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to update experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete experience - only allow if editing own profile or admin/manager
  const deleteExperience = async (id: string) => {
    if (!targetProfileId) return false;
    
    // Check if user can edit this profile
    if (targetProfileId !== user?.id && user?.role !== 'admin' && user?.role !== 'manager') {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to edit this profile',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      
      toast({
        title: 'Success',
        description: 'Experience has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove experience',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load experiences data
  useEffect(() => {
    if (targetProfileId) {
      fetchExperiences();
    }
  }, [targetProfileId]);

  return {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience
  };
}
