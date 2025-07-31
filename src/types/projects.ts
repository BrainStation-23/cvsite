
export interface Project {
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
  project_type_data?: {
    name: string;
  } | null;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export interface ProjectFormData {
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  is_active: boolean;
}

export interface ProjectFilters {
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showInactiveProjects: boolean;
}
