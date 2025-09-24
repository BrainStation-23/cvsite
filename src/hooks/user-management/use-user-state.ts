
import { useState } from 'react';
import { UserData, PaginationData, SortColumn, SortOrder } from '../types/user-management';

export function useUserState() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    filteredCount: 0,
    page: 1,
    perPage: 10,
    pageCount: 0
  });
  
  // Basic filters
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [filterCustomRoleId, setFilterCustomRoleId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // New advanced filters
  const [filterSbuId, setFilterSbuId] = useState<string | null>(null);
  const [filterManagerId, setFilterManagerId] = useState<string | null>(null);
  const [filterResourceTypeId, setFilterResourceTypeId] = useState<string | null>(null);
  const [filterExpertiseId, setFilterExpertiseId] = useState<string | null>(null);
  const [filterTotalYears, setFilterTotalYears] = useState<[number, number]>([0, 50]);
  const [filterCompanyYears, setFilterCompanyYears] = useState<[number, number]>([0, 30]);
  
  return {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    isLoading,
    setIsLoading,
    isDeleting,
    setIsDeleting,
    isBulkUploading,
    setIsBulkUploading,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
    filterCustomRoleId,
    setFilterCustomRoleId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterSbuId,
    setFilterSbuId,
    filterManagerId,
    setFilterManagerId,
    filterResourceTypeId,
    setFilterResourceTypeId,
    filterExpertiseId,
    setFilterExpertiseId,
    filterTotalYears,
    setFilterTotalYears,
    filterCompanyYears,
    setFilterCompanyYears
  };
}
