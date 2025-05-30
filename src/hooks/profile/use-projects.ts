import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';

// Type for database project record format
type ProjectDB = {
  id: string;
  profile_id: string;
  name: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  technologies_used?: string[];
  url?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
};

// Map from database format to application model
const mapToProject = (data: ProjectDB): Project => ({
  id: data.id,
  name: data.name,
  role: data.role,
  description: data.description,
  startDate: new Date(data.start_date),
  endDate: data.end_date ? new Date(data.end_date) : undefined,
  isCurrent: data.is_current || false,
  technologiesUsed: data.technologies_used || [],
  url: data.url
});

// Map from application model to database format
const mapToProjectDB = (project: Omit<Project, 'id'>, profileId: string) => ({
  profile_id: profileId,
  name: project.name,
  role: project.role,
  description: project.description,
  start_date: project.startDate.toISOString().split('T')[0],
  end_date: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
  is_current: project.isCurrent || false,
  technologies_used: project.technologiesUsed,
  url: project.url || null
});

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
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToProject);
        setProjects(mappedData);
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
  const saveProject = useMutation(
    async (project: Omit<Project, 'id'>) => {
      if (!targetProfileId) return false;
      
      try {
        setIsSaving(true);
        
        // Get the next display order
        const { data: existingProjects } = await supabase
          .from('projects')
          .select('display_order')
          .eq('profile_id', targetProfileId)
          .order('display_order', { ascending: false })
          .limit(1);
        
        const nextDisplayOrder = existingProjects && existingProjects.length > 0 
          ? (existingProjects[0].display_order || 0) + 1 
          : 1;
        
        // Convert to database format
        const dbData = {
          ...mapToProjectDB(project, targetProfileId),
          display_order: nextDisplayOrder
        };
        
        const { data, error } = await supabase
          .from('projects')
          .insert(dbData)
          .select();
        
        if (error) throw error;
        
        // Update local state with the new project entry
        if (data && data.length > 0) {
          const newProject = mapToProject(data[0] as ProjectDB);
          setProjects(prev => [...prev, newProject]);
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );

  // Update project
  const updateProject = useMutation(
    async (id: string, project: Partial<Project>) => {
      if (!targetProfileId) return false;
      
      try {
        setIsSaving(true);
        
        // Convert partial project data to database format
        const dbData: Partial<ProjectDB> = {};
        
        if (project.name) dbData.name = project.name;
        if (project.role) dbData.role = project.role;
        if (project.description !== undefined) dbData.description = project.description;
        if (project.startDate) dbData.start_date = project.startDate.toISOString().split('T')[0];
        
        if (project.endDate) {
          dbData.end_date = project.endDate.toISOString().split('T')[0];
        } else if (project.endDate === null) {
          dbData.end_date = null;
        }
        
        if (project.isCurrent !== undefined) dbData.is_current = project.isCurrent;
        if (project.technologiesUsed !== undefined) dbData.technologies_used = project.technologiesUsed;
        if (project.url !== undefined) dbData.url = project.url;
        
        dbData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('projects')
          .update(dbData)
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );

  // Delete project
  const deleteProject = useMutation(
    async (id: string) => {
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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );

  // Reorder projects
  const reorderProjects = useMutation(
    async (reorderedProjects: Project[]) => {
      if (!targetProfileId) return false;
      
      try {
        setIsSaving(true);
        
        // Update display_order for all projects
        const updates = reorderedProjects.map((project, index) => 
          supabase
            .from('projects')
            .update({ display_order: index + 1 })
            .eq('id', project.id)
            .eq('profile_id', targetProfileId)
        );
        
        await Promise.all(updates);
        
        // Update local state
        setProjects(reorderedProjects);
        
        toast({
          title: 'Success',
          description: 'Projects have been reordered',
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
      } finally {
        setIsSaving(false);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );

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
