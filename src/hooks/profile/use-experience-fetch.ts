
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

export interface ExperienceItem {
  id: string;
  profile_id: string;
  company_name: string;
  designation: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

const fetchExperiences = async (profileId: string | undefined) => {
  if (!profileId) {
    return [];
  }

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('profile_id', profileId)
    .order('start_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data as ExperienceItem[];
};

export const useExperienceFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['experiences', user?.id],
    queryFn: () => fetchExperiences(user?.id),
    enabled: !!user?.id,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching experiences",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
