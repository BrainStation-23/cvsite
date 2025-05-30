
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

const useAchievementsFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAchievements = async (): Promise<Achievement[]> => {
    if (!user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: 'Error fetching achievements',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const query = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: fetchAchievements,
    enabled: !!user?.id,
  });

  return {
    achievements: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useAchievementsFetch;
