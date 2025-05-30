import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Education {
  id: string;
  start_date: string;
  end_date: string | null;
  institution: string;
  degree: string;
  description: string | null;
}

const useEducationFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['education', user?.id],
    queryFn: async (): Promise<Education[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching education',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data || [];
    },
  });
};

export default useEducationFetch;

