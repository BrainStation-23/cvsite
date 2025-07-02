
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
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
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
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

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('search_projects', {
        search_query: searchQuery || null,
        page_number: currentPage,
        items_per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (error) throw error;

      const response = data as ProjectsResponse;
      setProjects(response.projects || []);
      setPagination(response.pagination);
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
        .insert(project);

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
      const { error } = await supabase
        .from('projects_management')
        .update(project)
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

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects_management')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, currentPage, itemsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
}
