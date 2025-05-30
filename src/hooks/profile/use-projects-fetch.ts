import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  user_id: string;
}

const useProjectsFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async (): Promise<Project[]> => {
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching projects',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }

    return data || [];
  };

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery(['projects'], fetchProjects);

  return {
    projects: projects || [],
    isLoading,
    error,
  };
};

export default useProjectsFetch;

