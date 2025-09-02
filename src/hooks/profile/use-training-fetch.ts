
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Training } from '@/types';

export function useTrainingFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const fetchTrainings = async () => {
    if (!profileId) return;

    try {
      const { data: trainingData, error: trainingError } = await supabase
        .from('trainings')
        .select('*')
        .eq('profile_id', profileId)
        .order('certification_date', { ascending: false });

      if (trainingError) throw trainingError;

      if (trainingData) {
        setTrainings(trainingData.map(training => ({
          id: training.id,
          title: training.title,
          provider: training.provider,
          description: training.description || '',
          date: training.certification_date,
          certificateUrl: training.certificate_url
        })));
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trainings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [profileId]);

  return {
    isLoading,
    trainings,
    refetch: fetchTrainings
  };
}
