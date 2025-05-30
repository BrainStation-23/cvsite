
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Education {
  id: string;
  university: string;
  degree: string;
  department: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: string | null;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

const useEducationFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEducation = async (): Promise<Education[]> => {
    if (!user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: 'Error fetching education',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const query = useQuery({
    queryKey: ['education', user?.id],
    queryFn: fetchEducation,
    enabled: !!user?.id,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useEducationFetch;
