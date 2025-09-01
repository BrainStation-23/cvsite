
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Achievement } from '@/types';

export const useAchievementsFetch = (profileId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('profile_id', profileId)
          .order('date', { ascending: false });

        if (error) throw error;

        const formattedAchievements = data?.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          date: achievement.date // Keep as string since it comes from database as string
        })) || [];

        setAchievements(formattedAchievements);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchAchievements();
    }
  }, [profileId]);

  return { achievements, isLoading, error };
};
