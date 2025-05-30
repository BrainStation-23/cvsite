
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';

export interface ProjectFormData {
  name: string;
  description: string;
  role: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  technologies_used?: string[] | null;
  url?: string | null;
}

export function useProjects(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch projects
  const fetchProjects = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save project
  const saveProject = async (project: Omit<Project, 'id'>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          profile_id: targetProfileId,
        })
        .select();
      
      if (error) throw error;
      
      // Update local state with the new project
      if (data && data.length > 0) {
        setProjects(prev => [...prev, data[0]]);
      }
      
      toast({
        title: 'Success',
        description: 'Project has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update project
  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setProjects(prev => 
        prev.map(item => item.id === id ? { ...item, ...project } : item)
      );
      
      toast({
        title: 'Success',
        description: 'Project has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setProjects(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Project has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove project',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Reorder projects
  const reorderProjects = async (reorderedProjects: Project[]) => {
    if (!targetProfileId) return false;
    
    try {
      // Update display_order for each project
      const updates = reorderedProjects.map((project, index) => 
        supabase
          .from('projects')
          .update({ display_order: index })
          .eq('id', project.id)
          .eq('profile_id', targetProfileId)
      );
      
      await Promise.all(updates);
      
      // Update local state
      setProjects(reorderedProjects);
      
      toast({
        title: 'Success',
        description: 'Project order has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder projects',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load projects data
  useEffect(() => {
    if (targetProfileId) {
      fetchProjects();
    }
  }, [targetProfileId]);

  return {
    projects,
    isLoading,
    isSaving,
    saveProject,
    updateProject,
    deleteProject,
    reorderProjects
  };
}
