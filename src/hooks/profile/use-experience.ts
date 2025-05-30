import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Experience } from '@/types';

// Type for database experience record format
// Updated to remove position field which is no longer in the schema
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
  startDate: new Date(data.start_date),
  endDate: data.end_date ? new Date(data.end_date) : undefined,
  isCurrent: data.is_current || false
});

// Map from application model to database format
const mapToExperienceDB = (exp: Omit<Experience, 'id'>, profileId: string) => ({
  profile_id: profileId,
  company_name: exp.companyName,
  designation: exp.designation,
  description: exp.description,
  start_date: exp.startDate.toISOString().split('T')[0],
  end_date: exp.endDate ? exp.endDate.toISOString().split('T')[0] : null,
  is_current: exp.isCurrent || false
});

export function useExperience(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch experiences
  const fetchExperiences = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToExperience);
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

  // Save experience
  const saveExperience = useMutation(
    async (experience: Omit<Experience, 'id'>) => {
      if (!targetProfileId) return false;
      
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['experiences']);
      }
    }
  );

  // Update experience
  const updateExperience = useMutation(
    async (id: string, experience: Partial<Experience>) => {
      if (!targetProfileId) return false;
      
      try {
        setIsSaving(true);
        
        // Convert partial experience data to database format
        const dbData: Partial<ExperienceDB> = {};
        
        if (experience.companyName) dbData.company_name = experience.companyName;
        if (experience.designation) {
          dbData.designation = experience.designation;
        }
        if (experience.description !== undefined) dbData.description = experience.description;
        if (experience.startDate) dbData.start_date = experience.startDate.toISOString().split('T')[0];
        
        if (experience.endDate) {
          dbData.end_date = experience.endDate.toISOString().split('T')[0];
        } else if (experience.endDate === null) {
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['experiences']);
      }
    }
  );

  // Delete experience
  const deleteExperience = useMutation(
    async (id: string) => {
      if (!targetProfileId) return false;
      
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['experiences']);
      }
    }
  );

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
