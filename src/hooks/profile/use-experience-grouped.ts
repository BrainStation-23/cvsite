
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Position {
  id: string;
  designation: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  duration_months: number;
}

interface CompanyExperience {
  company_name: string;
  total_duration_months: number;
  positions: Position[];
  earliest_start_date: string;
  latest_end_date?: string;
  is_current_company: boolean;
}

export function useExperienceGrouped(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedExperiences, setGroupedExperiences] = useState<CompanyExperience[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch grouped experiences
  const fetchGroupedExperiences = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_experiences_by_company', {
        profile_uuid: targetProfileId
      });
      
      if (error) throw error;
      
      if (data) {
        // Properly cast the JSON response to our expected type
        const typedData = (data as unknown) as CompanyExperience[];
        setGroupedExperiences(typedData || []);
      }
    } catch (error) {
      console.error('Error fetching grouped experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load experience information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format duration
  const formatDuration = (months: number) => {
    if (months < 1) return '< 1 month';
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  // Load experiences data
  useEffect(() => {
    if (targetProfileId) {
      fetchGroupedExperiences();
    }
  }, [targetProfileId]);

  return {
    groupedExperiences,
    isLoading,
    formatDuration,
    refetch: fetchGroupedExperiences
  };
}
