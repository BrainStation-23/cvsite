
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectsResponse, ProjectFilters, AdvancedProjectFilters } from '@/types/projects';

export class EnhancedProjectsApiService {
  // Use the new search_projects RPC function with enhanced filtering
  static async searchProjects(filters: ProjectFilters): Promise<ProjectsResponse> {
    const {
      searchQuery,
      currentPage,
      itemsPerPage,
      sortBy,
      sortOrder,
      showInactiveProjects,
      projectTypeFilter,
      projectLevelFilter,
      budgetMin,
      budgetMax,
      projectManagerFilter,
      createdAfter,
      createdBefore
    } = filters;

    console.log('Calling enhanced search_projects RPC with filters:', filters);

    const { data, error } = await supabase.rpc('search_projects', {
      search_query: searchQuery || null,
      page_number: currentPage,
      items_per_page: itemsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      show_inactive_projects: showInactiveProjects,
      project_type_filter: projectTypeFilter || null,
      project_level_filter: projectLevelFilter || null,
      budget_min: budgetMin || null,
      budget_max: budgetMax || null,
      project_manager_filter: projectManagerFilter || null,
      created_after: createdAfter || null,
      created_before: createdBefore || null
    });

    if (error) {
      console.error('Enhanced search_projects RPC error:', error);
      throw error;
    }

    console.log('Enhanced search_projects RPC response:', data);
    return data as ProjectsResponse;
  }

  // Get unique project types for filtering
  static async getProjectTypes(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('project_types')
      .select('id, name')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get unique project levels for filtering
  static async getProjectLevels(): Promise<string[]> {
    const { data, error } = await supabase
      .from('projects_management')
      .select('project_level')
      .not('project_level', 'is', null)
      .order('project_level');

    if (error) throw error;
    
    // Extract unique project levels
    const uniqueLevels = [...new Set(data?.map(item => item.project_level).filter(Boolean))];
    return uniqueLevels;
  }

  // Get project managers for filtering
  static async getProjectManagers(): Promise<Array<{ id: string; name: string; employee_id: string }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        employee_id,
        general_information!inner(first_name, last_name)
      `)
      .not('id', 'is', null);

    if (error) throw error;

    return (data || []).map(profile => ({
      id: profile.id,
      name: `${profile.general_information?.first_name || profile.first_name || ''} ${profile.general_information?.last_name || profile.last_name || ''}`.trim(),
      employee_id: profile.employee_id || ''
    })).filter(pm => pm.name); // Only include entries with names
  }

  // Legacy methods for backward compatibility
  static async fetchProjects(filters: ProjectFilters): Promise<ProjectsResponse> {
    return this.searchProjects(filters);
  }

  static async createProject(projectData: any): Promise<void> {
    const { error } = await supabase
      .from('projects_management')
      .insert({
        project_name: projectData.project_name,
        client_name: projectData.client_name,
        project_manager: projectData.project_manager,
        budget: projectData.budget,
        is_active: projectData.is_active,
        description: projectData.description,
        project_level: projectData.project_level,
        project_type: projectData.project_type
      });

    if (error) throw error;
  }

  static async updateProject(id: string, projectData: any): Promise<void> {
    const updateData: any = {};
    if (projectData.project_name !== undefined) updateData.project_name = projectData.project_name;
    if (projectData.client_name !== undefined) updateData.client_name = projectData.client_name;
    if (projectData.project_manager !== undefined) updateData.project_manager = projectData.project_manager;
    if (projectData.budget !== undefined) updateData.budget = projectData.budget;
    if (projectData.is_active !== undefined) updateData.is_active = projectData.is_active;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.project_level !== undefined) updateData.project_level = projectData.project_level;
    if (projectData.project_type !== undefined) updateData.project_type = projectData.project_type;

    const { error } = await supabase
      .from('projects_management')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleProjectStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('projects_management')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects_management')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete project: it has associated resource planning entries. Please remove all resource assignments first.');
      }
      throw error;
    }
  }
}
