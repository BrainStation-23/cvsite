
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';

export function useProjectsFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    if (!profileId) return;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: false });

      if (projectError) throw projectError;

      if (projectData) {
        setProjects(projectData.map(project => ({
          id: project.id,
          name: project.name,
          role: project.role,
          description: project.description,
          responsibility: project.responsibility || '',
          startDate: project.start_date,
          endDate: project.end_date || undefined,
          isCurrent: project.is_current || false,
          technologiesUsed: project.technologies_used || [],
          url: project.url
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profileId]);

  return {
    isLoading,
    projects,
    refetch: fetchProjects
  };
}
