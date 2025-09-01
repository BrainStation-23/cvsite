
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types';

export const useProjectsFetch = (profileId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (error) throw error;

        const formattedProjects = data?.map(project => ({
          id: project.id,
          name: project.name,
          role: project.role,
          description: project.description,
          responsibility: project.responsibility,
          startDate: project.start_date, // Keep as string
          endDate: project.end_date, // Keep as string
          isCurrent: project.is_current,
          technologiesUsed: project.technologies_used || [],
          url: project.url || ''
        })) || [];

        setProjects(formattedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchProjects();
    }
  }, [profileId]);

  return { projects, isLoading, error };
};
