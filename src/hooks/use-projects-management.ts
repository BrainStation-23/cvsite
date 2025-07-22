import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  project_manager_profile?: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
  } | null;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

interface UseProjectsManagementReturn {
  projects: Project[];
  pagination: ProjectsResponse['pagination'] | null;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  showInactiveProjects: boolean;
  setShowInactiveProjects: (show: boolean) => void;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  toggleProjectStatus: (id: string, isActive: boolean) => Promise<boolean>;
  refetch: () => void;
}

export function useProjectsManagement(): UseProjectsManagementReturn {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectsResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('project_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showInactiveProjects, setShowInactiveProjects] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Build the query with joins for project manager profile
      let query = supabase
        .from('projects_management')
        .select(`
          *,
          project_manager_profile:profiles!projects_management_project_manager_fkey(
            first_name,
            last_name,
            employee_id
          )
        `);

      // Apply active/inactive filter
      if (!showInactiveProjects) {
        query = query.eq('is_active', true);
      }

      // Apply search filter if provided - FIX: Single line OR clause
      if (searchQuery) {
        query = query.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      if (sortBy === 'project_manager') {
        // For project manager sorting, we'll sort by the profile name
        query = query.order('project_manager_profile(first_name)', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get total count for pagination
      let countQuery = supabase
        .from('projects_management')
        .select('*', { count: 'exact', head: true });
      
      if (!showInactiveProjects) {
        countQuery = countQuery.eq('is_active', true);
      }

      if (searchQuery) {
        countQuery = countQuery.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
      }

      const { count: totalCount } = await countQuery;

      const totalRecords = totalCount || 0;
      const filteredRecords = count !== null ? count : (data?.length || 0);

      setProjects(data || []);
      setPagination({
        total_count: totalRecords,
        filtered_count: filteredRecords,
        page: currentPage,
        per_page: itemsPerPage,
        page_count: Math.ceil(filteredRecords / itemsPerPage)
      });
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

  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects_management')
        .insert({
          project_name: project.project_name,
          client_name: project.client_name,
          project_manager: project.project_manager,
          budget: project.budget,
          is_active: project.is_active
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project created successfully'
      });

      fetchProjects();
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateProject = async (id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (project.project_name !== undefined) updateData.project_name = project.project_name;
      if (project.client_name !== undefined) updateData.client_name = project.client_name;
      if (project.project_manager !== undefined) updateData.project_manager = project.project_manager;
      if (project.budget !== undefined) updateData.budget = project.budget;
      if (project.is_active !== undefined) updateData.is_active = project.is_active;

      const { error } = await supabase
        .from('projects_management')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project updated successfully'
      });

      fetchProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
      return false;
    }
  };

  const toggleProjectStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects_management')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Project ${isActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchProjects();
      return true;
    } catch (error) {
      console.error('Error toggling project status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects_management')
        .delete()
        .eq('id', id);

      if (error) {
        // Check if it's a foreign key constraint error
        if (error.code === '23503') {
          toast({
            title: 'Cannot Delete Project',
            description: 'This project cannot be deleted because it has associated resource planning entries. Please remove all resource assignments first.',
            variant: 'destructive'
          });
          return false;
        }
        
        // Handle other types of errors
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });

      fetchProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, currentPage, itemsPerPage, sortBy, sortOrder, showInactiveProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showInactiveProjects]);

  return {
    projects,
    pagination,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showInactiveProjects,
    setShowInactiveProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    refetch: fetchProjects
  };
}
