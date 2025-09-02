
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Achievement } from '@/types';

export function useAchievementsFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const fetchAchievements = async () => {
    if (!profileId) return;

    try {
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (achievementError) throw achievementError;

      if (achievementData) {
        setAchievements(achievementData.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          date: achievement.date
        })));
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [profileId]);

  return {
    isLoading,
    achievements,
    refetch: fetchAchievements
  };
}
