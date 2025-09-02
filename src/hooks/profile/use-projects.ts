
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileProject } from '@/types';

export const useProjects = (profileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ProfileProject[];
    },
    enabled: !!profileId
  });

  const createProject = useMutation({
    mutationFn: async (newProject: Omit<ProfileProject, 'id'>) => {
      const maxOrder = projects.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          display_order: maxOrder + 1,
          profile_id: profileId,
          name: newProject.name,
          role: newProject.role,
          description: newProject.description,
          responsibility: newProject.responsibility || '',
          start_date: newProject.startDate instanceof Date ? newProject.startDate.toISOString().split('T')[0] : newProject.startDate,
          end_date: newProject.endDate ? (newProject.endDate instanceof Date ? newProject.endDate.toISOString().split('T')[0] : newProject.endDate) : null,
          is_current: newProject.isCurrent,
          technologies_used: newProject.technologiesUsed || [],
          url: newProject.url || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({
        title: 'Success',
        description: 'Project added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive',
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<ProfileProject, 'id'>> }) => {
      const updateData: any = { ...updates };
      if (updateData.startDate) {
        updateData.start_date = updateData.startDate instanceof Date ? updateData.startDate.toISOString().split('T')[0] : updateData.startDate;
        delete updateData.startDate;
      }
      if (updateData.endDate) {
        updateData.end_date = updateData.endDate instanceof Date ? updateData.endDate.toISOString().split('T')[0] : updateData.endDate;
        delete updateData.endDate;
      }
      if (updateData.technologiesUsed) {
        updateData.technologies_used = updateData.technologiesUsed;
        delete updateData.technologiesUsed;
      }
      if (updateData.isCurrent !== undefined) {
        updateData.is_current = updateData.isCurrent;
        delete updateData.isCurrent;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  const updateProjectOrder = useMutation({
    mutationFn: async (projectsWithNewOrder: { id: string; displayOrder: number }[]) => {
      const updates = projectsWithNewOrder.map(project =>
        supabase
          .from('projects')
          .update({ display_order: project.displayOrder })
          .eq('id', project.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update project order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
    },
  });

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    updateProjectOrder,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    isDeleting: deleteProject.isPending,
    isReordering: updateProjectOrder.isPending,
  };
};
