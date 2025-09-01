
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Training } from '@/types';

export const useTrainingFetch = (profileId: string) => {
  const [training, setTraining] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('training')
          .select('*')
          .eq('profile_id', profileId)
          .order('date', { ascending: false });

        if (error) throw error;

        const formattedTraining = data?.map(training => ({
          id: training.id,
          title: training.title,
          provider: training.provider,
          description: training.description,
          date: training.date, // Keep as string
          certificateUrl: training.certificate_url || '',
          isRenewable: training.is_renewable || false,
          expiryDate: training.expiry_date // Keep as string
        })) || [];

        setTraining(formattedTraining);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchTraining();
    }
  }, [profileId]);

  return { training, isLoading, error };
};
