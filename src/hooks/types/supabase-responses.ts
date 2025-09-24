
export interface ListUsersResponse {
  users: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    first_name: string;
    last_name: string;
    custom_role_id: string | null;
    custom_role_name: string | null;
    sbu_context: string | null;
    sbu_context_name: string | null;
    employee_id?: string;
    sbu_id?: string | null;
    sbu_name?: string | null;
    date_of_joining?: string | null;
    career_start_date?: string | null;
    manager_id?: string | null;
    manager_name?: string | null;
    expertise_id?: string | null;
    expertise_name?: string | null;
    resource_type_id?: string | null;
    resource_type_name?: string | null;
  }[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}
