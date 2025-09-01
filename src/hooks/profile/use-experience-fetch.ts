
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience } from '@/types';

export const useExperienceFetch = (profileId: string) => {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('experience')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (error) throw error;

        const formattedExperience = data?.map(exp => ({
          id: exp.id,
          companyName: exp.company_name,
          designation: exp.designation,
          description: exp.description,
          startDate: exp.start_date, // Keep as string
          endDate: exp.end_date, // Keep as string
          isCurrent: exp.is_current
        })) || [];

        setExperience(formattedExperience);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchExperience();
    }
  }, [profileId]);

  return { experience, isLoading, error };
};
