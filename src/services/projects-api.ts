
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectsResponse, ProjectFormData, ProjectFilters } from '@/types/projects';

export class ProjectsApiService {
  static async fetchProjects(filters: ProjectFilters): Promise<ProjectsResponse> {
    const {
      searchQuery,
      currentPage,
      itemsPerPage,
      sortBy,
      sortOrder,
      showInactiveProjects
    } = filters;

    // Build the query with joins for project manager profile and project type
    let query = supabase
      .from('projects_management')
      .select(`
        *,
        project_manager_profile:profiles!projects_management_project_manager_fkey(
          first_name,
          last_name,
          employee_id
        ),
        project_type_data:project_types!projects_management_project_type_fkey(
          name
        )
      `);

    // Apply active/inactive filter
    if (!showInactiveProjects) {
      query = query.eq('is_active', true);
    }

    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
    }

    // Apply sorting
    if (sortBy === 'project_manager') {
      query = query.order('project_manager_profile(first_name)', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    // Get counts for pagination
    const counts = await this.getCounts(searchQuery, showInactiveProjects);

    return {
      projects: data || [],
      pagination: {
        total_count: counts.totalCount,
        filtered_count: counts.filteredCount,
        page: currentPage,
        per_page: itemsPerPage,
        page_count: Math.ceil(counts.filteredCount / itemsPerPage)
      }
    };
  }

  private static async getCounts(searchQuery: string, showInactiveProjects: boolean) {
    // Get filtered count
    let countQuery = supabase
      .from('projects_management')
      .select('*', { count: 'exact', head: true });
    
    if (!showInactiveProjects) {
      countQuery = countQuery.eq('is_active', true);
    }

    if (searchQuery) {
      countQuery = countQuery.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
    }

    const { count: filteredCount } = await countQuery;

    // Get total count without search filters
    let totalCountQuery = supabase
      .from('projects_management')
      .select('*', { count: 'exact', head: true });

    if (!showInactiveProjects) {
      totalCountQuery = totalCountQuery.eq('is_active', true);
    }

    const { count: totalCount } = await totalCountQuery;

    return {
      totalCount: totalCount || 0,
      filteredCount: filteredCount || 0
    };
  }

  static async createProject(projectData: ProjectFormData): Promise<void> {
    const { error } = await supabase
      .from('projects_management')
      .insert({
        project_name: projectData.project_name,
        client_name: projectData.client_name,
        project_manager: projectData.project_manager,
        budget: projectData.budget,
        is_active: projectData.is_active
      });

    if (error) throw error;
  }

  static async updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<void> {
    const updateData: any = {};
    if (projectData.project_name !== undefined) updateData.project_name = projectData.project_name;
    if (projectData.client_name !== undefined) updateData.client_name = projectData.client_name;
    if (projectData.project_manager !== undefined) updateData.project_manager = projectData.project_manager;
    if (projectData.budget !== undefined) updateData.budget = projectData.budget;
    if (projectData.is_active !== undefined) updateData.is_active = projectData.is_active;

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
