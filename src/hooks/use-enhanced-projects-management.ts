
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedProjectsApiService } from '@/services/enhanced-projects-api';
import { Project, ProjectsResponse, ProjectFormData, ProjectFilters, AdvancedProjectFilters, ProjectData } from '@/types/projects';

interface UseEnhancedProjectsManagementReturn {
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
  advancedFilters: AdvancedProjectFilters;
  setAdvancedFilters: (filters: AdvancedProjectFilters) => void;
  clearAdvancedFilters: () => void;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  toggleProjectStatus: (id: string, isActive: boolean) => Promise<boolean>;
  refetch: () => void;
}

export function useEnhancedProjectsManagement(): UseEnhancedProjectsManagementReturn {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectsResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Basic filters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('project_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showInactiveProjects, setShowInactiveProjects] = useState(false);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedProjectFilters>({});

  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      const filters: ProjectFilters = {
        searchQuery,
        currentPage,
        itemsPerPage,
        sortBy,
        sortOrder,
        showInactiveProjects,
        // Map advanced filters to RPC parameters
        projectTypeFilter: advancedFilters.projectType,
        projectLevelFilter: advancedFilters.projectLevel,
        budgetMin: advancedFilters.budgetRange?.min,
        budgetMax: advancedFilters.budgetRange?.max,
        projectManagerFilter: advancedFilters.projectManager,
        createdAfter: advancedFilters.dateRange?.start,
        createdBefore: advancedFilters.dateRange?.end
      };

      console.log('Fetching projects with enhanced filters:', filters);

      const response = await EnhancedProjectsApiService.searchProjects(filters);
      
      console.log('Enhanced projects response:', {
        totalRecords: response.pagination.total_count,
        filteredRecords: response.pagination.filtered_count,
        itemsPerPage,
        calculatedPageCount: response.pagination.page_count,
        currentPage
      });

      setProjects(response.projects);
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
      const projectData: ProjectData = {
        project_name: project.project_name,
        client_name: project.client_name,
        project_manager: project.project_manager,
        budget: project.budget,
        is_active: project.is_active,
        description: project.description || '',
        project_level: project.project_level,
        project_bill_type: project.project_bill_type,
        project_type: project.project_type
      };

      await EnhancedProjectsApiService.createProject(projectData);

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
      await EnhancedProjectsApiService.updateProject(id, project);

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
      await EnhancedProjectsApiService.toggleProjectStatus(id, isActive);

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
      await EnhancedProjectsApiService.deleteProject(id);

      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });

      fetchProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to delete project. Please try again.';
      const title = message.includes('Cannot delete project') ? 'Cannot Delete Project' : 'Error';
      
      toast({
        title,
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Fetch projects when dependencies change
  useEffect(() => {
    fetchProjects();
  }, [searchQuery, currentPage, itemsPerPage, sortBy, sortOrder, showInactiveProjects, advancedFilters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showInactiveProjects, advancedFilters]);

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
    advancedFilters,
    setAdvancedFilters,
    clearAdvancedFilters,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    refetch: fetchProjects
  };
}
