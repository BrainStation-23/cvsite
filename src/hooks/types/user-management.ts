
import { UserRole } from '@/types';

export type SortColumn = 'email' | 'first_name' | 'last_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: string;
  lastSignIn?: string;
}

export interface PaginationData {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

// Re-export UserRole to fix the import issues
export type { UserRole };
