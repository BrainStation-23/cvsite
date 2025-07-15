
import { UserRole } from '@/types';

export type SortColumn = 'email' | 'first_name' | 'last_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  sbuId?: string | null;
  sbuName?: string | null;
  createdAt?: string;
  lastSignIn?: string;
  dateOfJoining?: string | null;
  careerStartDate?: string | null;
  managerName?: string | null;
  expertiseName?: string | null;
  resourceTypeName?: string | null;
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
