
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Education } from '@/types';

export function useEducation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [education, setEducation] = useState<Education[]>([]);

  // Fetch education
  const fetchEducation = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setEducation(data);
      }
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: 'Error',
        description: 'Failed to load education information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save education
  const saveEducation = async (education: Omit<Education, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('education')
        .insert({
          ...education,
          profile_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      // Update local state
      setEducation(prev => [...prev, data[0]]);
      
      toast({
        title: 'Success',
        description: 'Education has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update education
  const updateEducation = async (id: string, educationData: Partial<Education>) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('education')
        .update({
          ...educationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setEducation(prev => 
        prev.map(edu => edu.id === id ? { ...edu, ...educationData } as Education : edu)
      );
      
      toast({
        title: 'Success',
        description: 'Education has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: 'Error',
        description: 'Failed to update education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete education
  const deleteEducation = async (id: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setEducation(prev => prev.filter(edu => edu.id !== id));
      
      toast({
        title: 'Success',
        description: 'Education has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove education',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load education data
  useEffect(() => {
    if (user?.id) {
      fetchEducation();
    }
  }, [user?.id]);

  return {
    education,
    isLoading,
    isSaving,
    saveEducation,
    updateEducation,
    deleteEducation
  };
}
