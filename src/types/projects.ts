
export interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description?: string | null;
  project_level?: string | null;
  project_bill_type?: string | null;
  project_type?: string | null;
  project_manager_profile?: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
  } | null;
  project_type_data?: {
    name: string;
    id: string;
  } | null;
  relevance_score?: number;
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
  description?: string | null;
  project_level?: string | null;
  project_bill_type?: string | null;
  project_type?: string | null;
}

// Enhanced filter interface for the new RPC function
export interface ProjectFilters {
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showInactiveProjects: boolean;
  // Advanced filters
  projectTypeFilter?: string | null;
  projectLevelFilter?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  projectManagerFilter?: string | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
}

// Advanced filters interface for UI components
export interface AdvancedProjectFilters {
  projectType?: string | null;
  projectLevel?: string | null;
  budgetRange?: {
    min?: number | null;
    max?: number | null;
  } | null;
  projectManager?: string | null;
  dateRange?: {
    start?: string | null;
    end?: string | null;
  } | null;
}
