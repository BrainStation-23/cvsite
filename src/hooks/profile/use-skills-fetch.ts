import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Skill {
  id: string;
  name: string;
  created_at: string;
}

const useSkillsFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        toast({
          title: 'Error fetching skills',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Skill[];
    },
    enabled: !!user?.id,
  });
};

export default useSkillsFetch;

