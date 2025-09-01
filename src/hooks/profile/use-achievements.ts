
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Achievement } from '@/types';

// Type for database achievement record format
type AchievementDB = {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
};

// Map from database format to application model
const mapToAchievement = (data: AchievementDB): Achievement => ({
  id: data.id,
  title: data.title,
  description: data.description,
  date: new Date(data.date)
});

// Map from application model to database format
const mapToAchievementDB = (achievement: Omit<Achievement, 'id'>, profileId: string) => ({
  profile_id: profileId,
  title: achievement.title,
  description: achievement.description,
  date: achievement.date.toISOString().split('T')[0]
});

export function useAchievements(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToAchievement);
        setAchievements(mappedData);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievement information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save achievement
  const saveAchievement = async (achievement: Omit<Achievement, 'id'>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert to database format
      const dbData = mapToAchievementDB(achievement, targetProfileId);
      
      const { data, error } = await supabase
        .from('achievements')
        .insert(dbData)
        .select();
      
      if (error) throw error;
      
      // Update local state with the new achievement entry
      if (data && data.length > 0) {
        const newAchievement = mapToAchievement(data[0] as AchievementDB);
        setAchievements(prev => [...prev, newAchievement]);
      }
      
      toast({
        title: 'Success',
        description: 'Achievement has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to add achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update achievement
  const updateAchievement = async (id: string, achievement: Partial<Achievement>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert partial achievement data to database format
      const dbData: Partial<AchievementDB> = {};
      
      if (achievement.title) dbData.title = achievement.title;
      if (achievement.description !== undefined) dbData.description = achievement.description;
      if (achievement.date) dbData.date = achievement.date.toISOString().split('T')[0];
      
      dbData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('achievements')
        .update(dbData)
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setAchievements(prev => 
        prev.map(item => item.id === id ? { ...item, ...achievement } : item)
      );
      
      toast({
        title: 'Success',
        description: 'Achievement has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete achievement
  const deleteAchievement = async (id: string) => {
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setAchievements(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Achievement has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove achievement',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load achievements data
  useEffect(() => {
    if (targetProfileId) {
      fetchAchievements();
    }
  }, [targetProfileId]);

  return {
    achievements,
    isLoading,
    isSaving,
    saveAchievement,
    updateAchievement,
    deleteAchievement
  };
}
