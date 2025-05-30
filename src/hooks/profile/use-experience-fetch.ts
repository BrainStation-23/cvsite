
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Experience } from '@/types';

export function useExperienceFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const fetchExperiences = async () => {
    if (!profileId) return;

    try {
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (expError) throw expError;

      if (expData) {
        setExperiences(expData.map(exp => ({
          id: exp.id,
          companyName: exp.company_name,
          designation: exp.designation || '',
          description: exp.description || '',
          startDate: new Date(exp.start_date),
          endDate: exp.end_date ? new Date(exp.end_date) : undefined,
          isCurrent: exp.is_current || false
        })));
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load experiences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [profileId]);

  return {
    isLoading,
    experiences,
    refetch: fetchExperiences
  };
}
