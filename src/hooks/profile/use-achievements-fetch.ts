import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Achievement {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  institution: string;
  date_obtained: string;
  description: string;
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
        .eq('user_id', user.id)
        .order('date_obtained', { ascending: false });

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

  const {
    data: achievements,
    isLoading,
    error,
  } = useQuery(['achievements'], fetchAchievements);

  return {
    achievements,
    isLoading,
    error,
  };
};

export default useAchievementsFetch;
