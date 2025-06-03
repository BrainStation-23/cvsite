
import { UserRole } from '@/types';

export interface ListUsersResponse {
  users: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    employee_id?: string;
    sbu_id?: string | null;
    sbu_name?: string | null;
  }[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}
