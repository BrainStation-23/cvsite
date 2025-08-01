
import { UserRole } from '@/types';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId: string;
  sbuId: string | null;
  sbuName: string | null;
  createdAt: string;
  lastSignIn?: string;
  dateOfJoining?: string | null;
  careerStartDate?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  expertiseId?: string | null;
  expertiseName?: string | null;
  resourceTypeId?: string | null;
  resourceTypeName?: string | null;
}

export interface PaginationData {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export type SortColumn = 'email' | 'first_name' | 'last_name' | 'created_at' | 'employee_id' | 'sbu_name';
export type SortOrder = 'asc' | 'desc';
