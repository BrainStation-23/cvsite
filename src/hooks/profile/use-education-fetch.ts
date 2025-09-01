
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Education } from '@/types';

export const useEducationFetch = (profileId: string) => {
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (error) throw error;

        const formattedEducation = data?.map(edu => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree,
          department: edu.department,
          gpa: edu.gpa,
          startDate: edu.start_date, // Keep as string
          endDate: edu.end_date, // Keep as string
          isCurrent: edu.is_current
        })) || [];

        setEducation(formattedEducation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchEducation();
    }
  }, [profileId]);

  return { education, isLoading, error };
};
