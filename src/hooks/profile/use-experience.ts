
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Experience } from '@/types';

export function useExperience() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Fetch experiences
  const fetchExperiences = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setExperiences(data);
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
  const saveExperience = async (experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          ...experience,
          profile_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      // Update local state
      setExperiences(prev => [...prev, data[0]]);
      
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

  // Update experience
  const updateExperience = async (id: string, experience: Partial<Experience>) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('experiences')
        .update({
          ...experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setExperiences(prev => 
        prev.map(exp => exp.id === id ? { ...exp, ...experience } as Experience : exp)
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

  // Delete experience
  const deleteExperience = async (id: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);
      
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
    if (user?.id) {
      fetchExperiences();
    }
  }, [user?.id]);

  return {
    experiences,
    isLoading,
    isSaving,
    saveExperience,
    updateExperience,
    deleteExperience
  };
}
