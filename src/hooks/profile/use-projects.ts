import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';

// Type for database project record format
type ProjectDB = {
  id: string;
  profile_id: string;
  name: string;
  role: string;
  description: string;
  responsibility?: string;
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
  responsibility: data.responsibility || '',
  startDate: data.start_date,
  endDate: data.end_date ? data.end_date : undefined,
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
  responsibility: project.responsibility || null,
  start_date: project.startDate,
  end_date: project.endDate ? project.endDate : null,
  is_current: project.isCurrent || false,
  technologies_used: project.technologiesUsed,
  url: project.url || null
});

export function useProjects(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const saveProject = async (project: Omit<Project, 'id'>) => {
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
  };

  // Update project
  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Create a clean database update object with only the fields that need updating
      const updateData: Record<string, any> = {};
      
      // Map each field explicitly to ensure correct column names
      if (project.name !== undefined) {
        updateData.name = project.name;
      }
      if (project.role !== undefined) {
        updateData.role = project.role;
      }
      if (project.description !== undefined) {
        updateData.description = project.description;
      }
      if (project.responsibility !== undefined) {
        updateData.responsibility = project.responsibility;
      }
      if (project.startDate !== undefined) {
        updateData.start_date = project.startDate;
      }
      if (project.endDate !== undefined) {
        updateData.end_date = project.endDate ? project.endDate : null;
      }
      if (project.isCurrent !== undefined) {
        updateData.is_current = project.isCurrent;
      }
      if (project.technologiesUsed !== undefined) {
        updateData.technologies_used = project.technologiesUsed;
      }
      if (project.url !== undefined) {
        updateData.url = project.url || null;
      }
      
      console.log('Updating project with database data:', updateData);
      console.log('Original project data received:', project);
      
      // Validate that we're not sending any camelCase properties to the database
      const invalidKeys = Object.keys(updateData).filter(key => 
        key.includes('technologiesUsed') || 
        key.includes('startDate') || 
        key.includes('endDate') || 
        key.includes('isCurrent')
      );
      
      if (invalidKeys.length > 0) {
        throw new Error(`Invalid camelCase keys detected: ${invalidKeys.join(', ')}`);
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
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
      setIsSaving(true);
      
      // Update display_order for all projects sequentially to avoid race conditions
      for (let i = 0; i < reorderedProjects.length; i++) {
        const project = reorderedProjects[i];
        const { error } = await supabase
          .from('projects')
          .update({ display_order: i + 1 })
          .eq('id', project.id)
          .eq('profile_id', targetProfileId);
        
        if (error) {
          console.error(`Error updating display order for project ${project.id}:`, error);
          throw error;
        }
      }
      
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
