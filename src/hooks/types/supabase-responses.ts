
import { UserRole } from '@/types';

// Define the interface for the RPC function response
export interface ListUsersResponse {
  users: Array<{
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    first_name: string | null;
    last_name: string | null;
    role: UserRole;
  }>;
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}
