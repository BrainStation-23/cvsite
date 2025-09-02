
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Education } from '@/types';

export function useEducationFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);

  const fetchEducation = async () => {
    if (!profileId) return;

    try {
      const { data: eduData, error: eduError } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (eduError) throw eduError;

      if (eduData) {
        setEducation(eduData.map(edu => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree || '',
          department: edu.department || undefined,
          gpa: edu.gpa || undefined,
          startDate: edu.start_date,
          endDate: edu.end_date ?? undefined,
          isCurrent: edu.is_current || false
        })));
      }
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: 'Error',
        description: 'Failed to load education',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [profileId]);

  return {
    isLoading,
    education,
    refetch: fetchEducation
  };
}
