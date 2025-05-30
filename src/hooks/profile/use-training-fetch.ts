
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

export interface Training {
  id: string;
  profile_id: string;
  title: string;
  provider: string;
  certification_date: string;
  description: string | null;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
}

const useTrainingFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['trainings', user?.id],
    queryFn: async (): Promise<Training[]> => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('profile_id', user.id)
        .order('certification_date', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching trainings',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });
};

export default useTrainingFetch;
